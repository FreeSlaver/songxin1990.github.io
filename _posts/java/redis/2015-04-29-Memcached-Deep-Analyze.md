---
layout: page

title: Memcached深度分析-转载
category: redis
categoryStr: 分布式
tags: cache
keywords: 
description: 
---




Memcached是danga.com（运营LiveJournal的技术团队）开发的一套分布式内存对象缓存系统，用于在动态系统中减少数据库 负载，提升性能。关于这个东西，相信很多人都用过，本文意在通过对memcached的实现及代码分析，获得对这个出色的开源软件更深入的了解，并可以根 据我们的需要对其进行更进一步的优化。末了将通过对BSM_Memcache扩展的分析，加深对memcached的使用方式理解。
本文的部分内容可能需要比较好的数学基础作为辅助。
◎Memcached是什么
在阐述这个问题之前，我们首先要清楚它“不是什么”。很多人把它当作和SharedMemory那种形式的存储载体来使用，虽然 memcached 使用了同样的“Key=>Value”方式组织数据，但是它和共享内存、APC等本地缓存有非常大的区别。Memcached是分布式的，也就是说 它不是本地的。它基于网络连接（当然它也可以使用localhost）方式完成服务，本身它是一个独立于应用的程序或守护进程（Daemon方式）。
Memcached使用libevent库实现网络连接服务，理论上可以处理无限多的连接，但是它和Apache不同，它更多的时候是面向稳定 的持 续连接的，所以它实际的并发能力是有限制的。在保守情况下memcached的最大同时连接数为200，这和Linux线程能力有关系，这个数值是可以调 整的。关于libevent可以参考相关文档。 Memcached内存使用方式也和APC不同。APC是基于共享内存和MMAP的，memcachd有自己的内存分配算法和管理方式，它和共享内存没有 关系，也没有共享内存的限制，通常情况下，每个memcached进程可以管理2GB的内存空间，如果需要更多的空间，可以增加进程数。
◎Memcached适合什么场合
在很多时候，memcached都被滥用了，这当然少不了对它的抱怨。我经常在论坛上看见有人发贴，类似于“如何提高效率”，回复是“用memcached”，至于怎么用，用在哪里，用来干什么一句没有。memcached不是万能的，它也不是适用在所有场合。
Memcached是“分布式”的内存对象缓存系统，那么就是说，那些不需要“分布”的，不需要共享的，或者干脆规模小到只有一台服务器的应 用，memcached不会带来任何好处，相反还会拖慢系统效率，因为网络连接同样需要资源，即使是UNIX本地连接也一样。 在我之前的测试数据中显示，memcached本地读写速度要比直接PHP内存数组慢几十倍，而APC、共享内存方式都和直接数组差不多。可见，如果只是 本地级缓存，使用memcached是非常不划算的。
Memcached在很多时候都是作为数据库前端cache使用的。因为它比数据库少了很多SQL解析、磁盘操作等开销，而且它是使用内存来管 理数 据的，所以它可以提供比直接读取数据库更好的性能，在大型系统中，访问同样的数据是很频繁的，memcached可以大大降低数据库压力，使系统执行效率 提升。另外，memcached也经常作为服务器之间数据共享的存储媒介，例如在SSO系统中保存系统单点登陆状态的数据就可以保存在memcached 中，被多个应用共享。
需要注意的是，memcached使用内存管理数据，所以它是易失的，当服务器重启，或者memcached进程中止，数据便会丢失，所以 memcached不能用来持久保存数据。很多人的错误理解，memcached的性能非常好，好到了内存和硬盘的对比程度，其实memcached使用 内存并不会得到成百上千的读写速度提高，它的实际瓶颈在于网络连接，它和使用磁盘的数据库系统相比，好处在于它本身非常“轻”，因为没有过多的开销和直接 的读写方式，它可以轻松应付非常大的数据交换量，所以经常会出现两条千兆网络带宽都满负荷了，memcached进程本身并不占用多少CPU资源的情况。
◎Memcached的工作方式
以下的部分中，读者最好能准备一份memcached的源代码。
Memcached是传统的网络服务程序，如果启动的时候使用了-d参数，它会以守护进程的方式执行。创建守护进程由daemon.c完成，这个程序只有一个daemon函数，这个函数很简单（如无特殊说明，代码以1.2.1为准）：
CODE:

```

#include <fcntl.h>
#include <stdlib.h>
#include <unistd.h>int
daemon(nochdir, noclose)
int nochdir, noclose;
{
int fd;
 
switch (fork()) {
case -1:
return (-1);
case 0:
break;
default:
_exit(0);
}
 
if (setsid() == -1)
return (-1);
 
if (!nochdir)
(void)chdir(”/”);
 
if (!noclose && (fd = open(”/dev/null”, O_RDWR, 0)) != -1) {
(void)dup2(fd, STDIN_FILENO);
(void)dup2(fd, STDOUT_FILENO);
(void)dup2(fd, STDERR_FILENO);
if (fd > STDERR_FILENO)
(void)close(fd);
}
return (0);
}
```
这个函数 fork 了整个进程之后，父进程就退出，接着重新定位 STDIN 、 STDOUT 、 STDERR 到空设备， daemon 就建立成功了。
Memcached 本身的启动过程，在 memcached.c 的 main 函数中顺序如下：
1 、调用 settings_init() 设定初始化参数
2 、从启动命令中读取参数来设置 setting 值
3 、设定 LIMIT 参数
4 、开始网络 socket 监听（如果非 socketpath 存在）（ 1.2 之后支持 UDP 方式）
5 、检查用户身份（ Memcached 不允许 root 身份启动）
6 、如果有 socketpath 存在，开启 UNIX 本地连接（Sock 管道）
7 、如果以 -d 方式启动，创建守护进程（如上调用 daemon 函数）
8 、初始化 item 、 event 、状态信息、 hash 、连接、 slab
9 、如设置中 managed 生效，创建 bucket 数组
10 、检查是否需要锁定内存页
11 、初始化信号、连接、删除队列
12 、如果 daemon 方式，处理进程 ID
13 、event 开始，启动过程结束， main 函数进入循环。
在 daemon 方式中，因为 stderr 已经被定向到黑洞，所以不会反馈执行中的可见错误信息。
memcached.c 的主循环函数是 drive_machine ，传入参数是指向当前的连接的结构指针，根据 state 成员的状态来决定动作。
Memcached 使用一套自定义的协议完成数据交换，它的 protocol 文档可以参考： http://code.sixapart.com/svn/memcached/trunk/server/doc/protocol.txt
在API中，换行符号统一为\r\n
◎Memcached的内存管理方式
Memcached有一个很有特色的内存管理方式，为了提高效率，它使用预申请和分组的方式管理内存空间，而并不是每次需要写入数据的时候去malloc，删除数据的时候free一个指针。Memcached使用slab->chunk的组织方式管理内存。
1.1和1.2的slabs.c中的slab空间划分算法有一些不同，后面会分别介绍。
Slab可以理解为一个内存块，一个slab是memcached一次申请内存的最小单位，在memcached中，一个slab的大小默认为 1048576字节（1MB），所以memcached都是整MB的使用内存。每一个slab被划分为若干个chunk，每个chunk里保存一个 item，每个item同时包含了item结构体、key和value（注意在memcached中的value是只有字符串的）。slab按照自己的 id分别组成链表，这些链表又按id挂在一个slabclass数组上，整个结构看起来有点像二维数组。slabclass的长度在1.1中是21，在 1.2中是200。
slab有一个初始chunk大小，1.1中是1字节，1.2中是80字节，1.2中有一个factor值，默认为1.25
在1.1中，chunk大小表示为初始大小*2^n，n为classid，即：id为0的slab，每chunk大小1字节，id为1的 slab， 每chunk大小2字节，id为2的slab，每chunk大小4字节……id为20的slab，每chunk大小为1MB，就是说id为20的slab 里只有一个chunk：
CODE:

```
void slabs_init(size_t limit) {
int i;
int size=1;mem_limit = limit;
for(i=0; i<=POWER_LARGEST; i++, size*=2) {
slabclass[i].size = size;
slabclass[i].perslab = POWER_BLOCK / size;
slabclass[i].slots = 0;
slabclass[i].sl_curr = slabclass[i].sl_total = slabclass[i].slabs = 0;
slabclass[i].end_page_ptr = 0;
slabclass[i].end_page_free = 0;
slabclass[i].slab_list = 0;
slabclass[i].list_size = 0;
slabclass[i].killing = 0;
}
 
/* for the test suite:  faking of how much we’ve already malloc’d */
{
char *t_initial_malloc = getenv(”T_MEMD_INITIAL_MALLOC”);
if (t_initial_malloc) {
mem_malloced = atol(getenv(”T_MEMD_INITIAL_MALLOC”));
}
}
 
/* pre-allocate slabs by default, unless the environment variable
for testing is set to something non-zero */
{
char *pre_alloc = getenv(”T_MEMD_SLABS_ALLOC”);
if (!pre_alloc || atoi(pre_alloc)) {
slabs_preallocate(limit / POWER_BLOCK);
}
}
}
```

在1.2中，chunk大小表示为初始大小*f^n，f为factor，在memcached.c中定义，n为classid，同时，201个 头不 是全部都要初始化的，因为factor可变，初始化只循环到计算出的大小达到slab大小的一半为止，而且它是从id1开始的，即：id为1的slab， 每chunk大小80字节，id为2的slab，每chunk大小80*f，id为3的slab，每chunk大小80*f^2，初始化大小有一个修正值 CHUNK_ALIGN_BYTES，用来保证n-byte排列 （保证结果是CHUNK_ALIGN_BYTES的整倍数）。这样，在标准情况下，memcached1.2会初始化到id40，这个slab中每个 chunk大小为504692，每个slab中有两个chunk。最后，slab_init函数会在最后补足一个id41，它是整块的，也就是这个 slab中只有一个1MB大的chunk：
CODE:

```
void slabs_init(size_t limit, double factor) {
int i = POWER_SMALLEST – 1;
unsigned int size = sizeof(item) + settings.chunk_size;/* Factor of 2.0 means use the default memcached behavior */
if (factor == 2.0 && size < 128)
size = 128;
 
mem_limit = limit;
memset(slabclass, 0, sizeof(slabclass));
 
while (++i < POWER_LARGEST && size <= POWER_BLOCK / 2) {
/* Make sure items are always n-byte aligned */
if (size % CHUNK_ALIGN_BYTES)
size += CHUNK_ALIGN_BYTES – (size % CHUNK_ALIGN_BYTES);
 
slabclass[i].size = size;
slabclass[i].perslab = POWER_BLOCK / slabclass[i].size;
size *= factor;
if (settings.verbose > 1) {
fprintf(stderr, “slab class %3d: chunk size %6d perslab %5d\n”,
i, slabclass[i].size, slabclass[i].perslab);
}
}
 
power_largest = i;
slabclass[power_largest].size = POWER_BLOCK;
slabclass[power_largest].perslab = 1;
 
/* for the test suite:  faking of how much we’ve already malloc’d */
{
char *t_initial_malloc = getenv(”T_MEMD_INITIAL_MALLOC”);
if (t_initial_malloc) {
mem_malloced = atol(getenv(”T_MEMD_INITIAL_MALLOC”));
}
 
}
 
#ifndef DONT_PREALLOC_SLABS
{
char *pre_alloc = getenv(”T_MEMD_SLABS_ALLOC”);
if (!pre_alloc || atoi(pre_alloc)) {
slabs_preallocate(limit / POWER_BLOCK);
}
}
#endif
}

```

由上可以看出，memcached的内存分配是有冗余的，当一个slab不能被它所拥有的chunk大小整除时，slab尾部剩余的空间就被丢弃了，如id40中，两个chunk占用了1009384字节，这个slab一共有1MB，那么就有39192字节被浪费了。
Memcached使用这种方式来分配内存，是为了可以快速的通过item长度定位出slab的classid，有一点类似hash，因为 item 的长度是可以计算的，比如一个item的长度是300字节，在1.2中就可以得到它应该保存在id7的slab中，因为按照上面的计算方法，id6的 chunk大小是252字节，id7的chunk大小是316字节，id8的chunk大小是396字节，表示所有252到316字节的item都应该保 存在id7中。同理，在1.1中，也可以计算得到它出于256和512之间，应该放在chunk_size为512的id9中(32位系统）。
Memcached初始化的时候，会初始化slab（前面可以看到，在main函数中调用了slabs_init()）。它会在 slabs_init()中检查一个常量DONT_PREALLOC_SLABS，如果这个没有被定义，说明使用预分配内存方式初始化slab，这样在所 有已经定义过的slabclass中，每一个id创建一个slab。这样就表示，1.2在默认的环境中启动进程后要分配41MB的slab空间，在这个过 程里，memcached的第二个内存冗余发生了，因为有可能一个id根本没有被使用过，但是它也默认申请了一个slab，每个slab会用掉1MB内存
当一个slab用光后，又有新的item要插入这个id，那么它就会重新申请新的slab，申请新的slab时，对应id的slab链表就要增长，这个链表是成倍增长的，在函数grow_slab_list函数中，这个链的长度从1变成2，从2变成4，从4变成8……：
CODE:

```
static int grow_slab_list (unsigned int id) {
slabclass_t *p = &slabclass[id];
if (p->slabs == p->list_size) {
size_t new_size =  p->list_size ? p->list_size * 2 : 16;
void *new_list = realloc(p->slab_list, new_size*sizeof(void*));
if (new_list == 0) return 0;
p->list_size = new_size;
p->slab_list = new_list;
}
return 1;
}

```
在定位item时，都是使用slabs_clsid函数，传入参数为item大小，返回值为classid，由这个过程可以看 出，memcached的第三个内存冗余发生在保存item的过程中，item总是小于或等于chunk大小的，当item小于chunk大小时，就又发 生了空间浪费。
◎Memcached的NewHash算法
Memcached的item保存基于一个大的hash表，它的实际地址就是slab中的chunk偏移，但是它的定位是依靠对key做 hash的 结果，在primary_hashtable中找到的。在assoc.c和items.c中定义了所有的hash和item操作。
Memcached使用了一个叫做NewHash的算法，它的效果很好，效率也很高。1.1和1.2的NewHash有一些不同，主要的实现方式还是一样的，1.2的hash函数是经过整理优化的，适应性更好一些。
NewHash的原型参考：http://burtleburtle.net/bob/hash/evahash.html。数学家总是有点奇怪，呵呵～
为了变换方便，定义了u4和u1两种数据类型，u4就是无符号的长整形，u1就是无符号char(0-255)。
具体代码可以参考1.1和1.2源码包。
注意这里的hashtable长度，1.1和1.2也是有区别的，1.1中定义了HASHPOWER常量为20，hashtable表长为 hashsize(HASHPOWER)，就是4MB（hashsize是一个宏，表示1右移n位），1.2中是变量16，即hashtable表长 65536：
CODE:

```
typedef  unsigned long  int  ub4;   /* unsigned 4-byte quantities */
typedef  unsigned       char ub1;   /* unsigned 1-byte quantities */#define hashsize(n) ((ub4)1<<(n))
#define hashmask(n) (hashsize(n)-1)

```
在assoc_init()中，会对primary_hashtable做初始化，对应的hash操作包括：assoc_find()、 assoc_expand()、assoc_move_next_bucket()、assoc_insert()、assoc_delete()，对应 于item的读写操作。其中assoc_find()是根据key和key长寻找对应的item地址的函数（注意在C中，很多时候都是同时直接传入字符串 和字符串长度，而不是在函数内部做strlen），返回的是item结构指针，它的数据地址在slab中的某个chunk上。
items.c是数据项的操作程序，每一个完整的item包括几个部分，在item_make_header()中定义为：
key：键
nkey：键长
flags：用户定义的flag（其实这个flag在memcached中没有启用）
nbytes：值长（包括换行符号\r\n）
suffix：后缀Buffer
nsuffix：后缀长
一个完整的item长度是键长＋值长＋后缀长＋item结构大小（32字节），item操作就是根据这个长度来计算slab的classid的。
hashtable中的每一个桶上挂着一个双链表，item_init()的时候已经初始化了heads、tails、sizes三个数组为 0，这 三个数组的大小都为常量LARGEST_ID（默认为255，这个值需要配合factor来修改），在每次item_assoc()的时候，它会首先尝试 从slab中获取一块空闲的chunk，如果没有可用的chunk，会在链表中扫描50次，以得到一个被LRU踢掉的item，将它unlink，然后将 需要插入的item插入链表中。
注意item的refcount成员。item被unlink之后只是从链表上摘掉，不是立刻就被free的，只是将它放到删除队列中（item_unlink_q()函数）。
item对应一些读写操作，包括remove、update、replace，当然最重要的就是alloc操作。
item还有一个特性就是它有过期时间，这是memcached的一个很有用的特性，很多应用都是依赖于memcached的item过期，比 如 session存储、操作锁等。item_flush_expired()函数就是扫描表中的item，对过期的item执行unlink操作，当然这只 是一个回收动作，实际上在get的时候还要进行时间判断：
CODE:

```

/* expires items that are more recent than the oldest_live setting. */
void item_flush_expired() {
int i;
item *iter, *next;
if (! settings.oldest_live)
return;
for (i = 0; i < LARGEST_ID; i++) {
/* The LRU is sorted in decreasing time order, and an item’s timestamp
* is never newer than its last access time, so we only need to walk
* back until we hit an item older than the oldest_live time.
* The oldest_live checking will auto-expire the remaining items.
*/
for (iter = heads[i]; iter != NULL; iter = next) {
if (iter->time >= settings.oldest_live) {
next = iter->next;
if ((iter->it_flags & ITEM_SLABBED) == 0) {
item_unlink(iter);
}
} else {
/* We’ve hit the first old item. Continue to the next queue. */
break;
}
}
}
}

```
CODE:

```

/* wrapper around assoc_find which does the lazy expiration/deletion logic */
item *get_item_notedeleted(char *key, size_t nkey, int *delete_locked) {
item *it = assoc_find(key, nkey);
if (delete_locked) *delete_locked = 0;
if (it && (it->it_flags & ITEM_DELETED)) {
/* it’s flagged as delete-locked.  let’s see if that condition
is past due, and the 5-second delete_timer just hasn’t
gotten to it yet… */
if (! item_delete_lock_over(it)) {
if (delete_locked) *delete_locked = 1;
it = 0;
}
}
if (it && settings.oldest_live && settings.oldest_live <= current_time &&
it->time <= settings.oldest_live) {
item_unlink(it);
it = 0;
}
if (it && it->exptime && it->exptime <= current_time) {
item_unlink(it);
it = 0;
}
return it;
}

```

Memcached的内存管理方式是非常精巧和高效的，它很大程度上减少了直接alloc系统内存的次数，降低函数开销和内存碎片产生几率，虽然这种方式会造成一些冗余浪费，但是这种浪费在大型系统应用中是微不足道的。

◎Memcached的理论参数计算方式
影响 memcached 工作的几个参数有：
常量REALTIME_MAXDELTA 60*60*24*30
最大30天的过期时间
conn_init()中的freetotal（=200）
最大同时连接数
常量KEY_MAX_LENGTH 250
最大键长
settings.factor（=1.25）
factor将影响chunk的步进大小
settings.maxconns（=1024）
最大软连接
settings.chunk_size（=48）
一个保守估计的key+value长度，用来生成id1中的chunk长度（1.2）。id1的chunk长度等于这个数值加上item结构体的长度（32），即默认的80字节。
常量POWER_SMALLEST 1
最小classid（1.2）
常量POWER_LARGEST 200
最大classid（1.2）
常量POWER_BLOCK 1048576
默认slab大小
常量CHUNK_ALIGN_BYTES (sizeof(void *))
保证chunk大小是这个数值的整数倍，防止越界（void *的长度在不同系统上不一样，在标准32位系统上是4）
常量ITEM_UPDATE_INTERVAL 60
队列刷新间隔
常量LARGEST_ID 255
最大item链表数（这个值不能比最大的classid小）
变量hashpower（在1.1中是常量HASHPOWER）
决定hashtable的大小
根据上面介绍的内容及参数设定，可以计算出的一些结果：
1、在memcached中可以保存的item个数是没有软件上限的，之前我的100万的说法是错误的。
2、假设NewHash算法碰撞均匀，查找item的循环次数是item总数除以hashtable大小（由hashpower决定），是线性的。
3、Memcached限制了可以接受的最大item是1MB，大于1MB的数据不予理会。
4、Memcached的空间利用率和数据特性有很大的关系，又与DONT_PREALLOC_SLABS常量有关。 在最差情况下，有198个slab会被浪费（所有item都集中在一个slab中，199个id全部分配满）。
◎Memcached的定长优化
根据上面几节的描述，多少对memcached有了一个比较深入的认识。在深入认识的基础上才好对它进行优化。
Memcached本身是为变长数据设计的，根据数据特性，可以说它是“面向大众”的设计，但是很多时候，我们的数据并不是这样的“普遍”，典 型的 情况中，一种是非均匀分布，即数据长度集中在几个区域内（如保存用户 Session）；另一种更极端的状态是等长数据（如定长键值，定长数据，多见于访问、在线统计或执行锁）。
这里主要研究一下定长数据的优化方案（1.2），集中分布的变长数据仅供参考，实现起来也很容易。
解决定长数据，首先需要解决的是slab的分配问题，第一个需要确认的是我们不需要那么多不同chunk长度的slab，为了最大限度地利用资源，最好chunk和item等长，所以首先要计算item长度。
在之前已经有了计算item长度的算法，需要注意的是，除了字符串长度外，还要加上item结构的长度32字节。
假设我们已经计算出需要保存200字节的等长数据。
接下来是要修改slab的classid和chunk长度的关系。在原始版本中，chunk长度和classid是有对应关系的，现在如果把所 有的 chunk都定为200个字节，那么这个关系就不存在了，我们需要重新确定这二者的关系。一种方法是，整个存储结构只使用一个固定的id，即只使用199 个槽中的1个，在这种条件下，就一定要定义DONT_PREALLOC_SLABS来避免另外的预分配浪费。另一种方法是建立一个hash关系，来从 item确定classid，不能使用长度来做键，可以使用key的NewHash结果等不定数据，或者直接根据key来做hash（定长数据的key也 一定等长）。这里简单起见，选择第一种方法，这种方法的不足之处在于只使用一个id，在数据量非常大的情况下，slab链会很长（因为所有数据都挤在一条 链上了），遍历起来的代价比较高。
前面介绍了三种空间冗余，设置chunk长度等于item长度，解决了第一种空间浪费问题，不预申请空间解决了第二种空间浪费问题，那么对于第 一种 问题（slab内剩余）如何解决呢，这就需要修改POWER_BLOCK常量，使得每一个slab大小正好等于chunk长度的整数倍，这样一个slab 就可以正好划分成n个chunk。这个数值应该比较接近1MB，过大的话同样会造成冗余，过小的话会造成次数过多的alloc，根据chunk长度为 200，选择1000000作为POWER_BLOCK的值，这样一个slab就是100万字节，不是1048576。三个冗余问题都解决了，空间利用率 会大大提升。
修改 slabs_clsid 函数，让它直接返回一个定值（比如 1 ）：
CODE:
unsigned int slabs_clsid(size_t size) {
return 1;
}
修改slabs_init函数，去掉循环创建所有classid属性的部分，直接添加slabclass[1]：
CODE:
slabclass[1].size = 200;                //每chunk200字节
slabclass[1].perslab = 5000;        //1000000/200
◎Memcached客户端
Memcached是一个服务程序，使用的时候可以根据它的协议，连接到memcached服务器上，发送命令给服务进程，就可以操作上面的数 据。 为了方便使用，memcached有很多个客户端程序可以使用，对应于各种语言，有各种语言的客户端。基于C语言的有libmemcache、 APR_Memcache；基于Perl的有Cache::Memcached；另外还有Python、Ruby、Java、C#等语言的支持。PHP的 客户端是最多的，不光有mcache和PECL memcache两个扩展，还有大把的由PHP编写的封装类，下面介绍一下在PHP中使用memcached的方法：
mcache扩展是基于libmemcache再封装的。libmemcache一直没有发布stable版本，目前版本是1.4.0- rc2，可 以在这里找到。libmemcache有一个很不好的特性，就是会向stderr写很多错误信息，一般的，作为lib使用的时候，stderr一般都会被 定向到其它地方，比如Apache的错误日志，而且libmemcache会自杀，可能会导致异常，不过它的性能还是很好的。
mcache扩展最后更新到1.2.0-beta10，作者大概是离职了，不光停止更新，连网站也打不开了（~_~），只能到其它地方去获取这 个不 负责的扩展了。解压后安装方法如常：phpize & configure & make & make install，一定要先安装libmemcache。使用这个扩展很简单：
CODE:

```

<?php
$mc = memcache();    // 创建一个memcache连接对象，注意这里不是用new！
$mc->add_server(‘localhost’, 11211);    // 添加一个服务进程
$mc->add_server(‘localhost’, 11212);    // 添加第二个服务进程
$mc->set(‘key1′, ‘Hello’);    // 写入key1 => Hello
$mc->set(‘key2′, ‘World’, 10);    // 写入key2 => World，10秒过期
$mc->set(‘arr1′, array(‘Hello’, ‘World’));    // 写入一个数组
$key1 = $mc->get(‘key1′);    // 获取’key1′的值，赋给$key1
$key2 = $mc->get(‘key2′);    // 获取’key2′的值，赋给$key2，如果超过10秒，就取不到了
$arr1 = $mc->get(‘arr1′);    // 获取’arr1′数组
$mc->delete(‘arr1′);    // 删除’arr1′
$mc->flush_all();    // 删掉所有数据
$stats = $mc->stats();    // 获取服务器信息
var_dump($stats);    // 服务器信息是一个数组
?>

```

这个扩展的好处是可以很方便地实现分布式存储和负载均衡，因为它可以添加多个服务地址，数据在保存的时候是会根据hash结果定位到某台服务器 上 的，这也是libmemcache的特性。libmemcache支持集中hash方式，包括CRC32、ELF和Perl hash。
PECL memcache是PECL发布的扩展，目前最新版本是2.1.0，可以在pecl网站得到。memcache扩展的使用方法可以在新一些的PHP手册中找到，它和mcache很像，真的很像：
CODE:

```

<?php$memcache
 
= new Memcache;
$memcache->connect(‘localhost’, 11211) or die (“Could not connect”); $version = $memcache->getVersion();
echo “Server’s version: ”.$version.“n”; $tmp_object = new stdClass;
$tmp_object->str_attr = ‘test’;
$tmp_object->int_attr = 123; $memcache->set(‘key’, $tmp_object, false, 10) or die (“Failed to save data at the server”);
echo “Store data in the cache (data will expire in 10 seconds)n”; $get_result = $memcache->get(‘key’);
echo “Data from the cache:n”; var_dump($get_result); ?>

```

这个扩展是使用php的stream直接连接memcached服务器并通过socket发送命令的。它不像libmemcache那样完善， 也不 支持add_server这种分布操作，但是因为它不依赖其它的外界程序，兼容性要好一些，也比较稳定。至于效率，差别不是很大。
另外，有很多的PHP class可以使用，比如MemcacheClient.inc.php，phpclasses.org上可以找到很多，一般都是对perl client API的再封装，使用方式很像。
◎BSM_Memcache
从C client来说，APR_Memcache是一个很成熟很稳定的client程序，支持线程锁和原子级操作，保证运行的稳定性。不过它是基于APR的 （APR将在最后一节介绍），没有libmemcache的应用范围广，目前也没有很多基于它开发的程序，现有的多是一些Apache Module，因为它不能脱离APR环境运行。但是APR倒是可以脱离Apache单独安装的，在APR网站上可以下载APR和APR-util，不需要 有Apache，可以直接安装，而且它是跨平台的。
BSM_Memcache是我在BS.Magic项目中开发的一个基于APR_Memcache的PHP扩展，说起来有点拗口，至少它把APR扯进了PHP扩展中。这个程序很简单，也没做太多的功能，只是一种形式的尝试，它支持服务器分组。
和mcache扩展支持多服务器分布存储不同，BSM_Memcache支持多组服务器，每一组内的服务器还是按照hash方式来分布保存数 据，但 是两个组中保存的数据是一样的，也就是实现了热备，它不会因为一台服务器发生单点故障导致数据无法获取，除非所有的服务器组都损坏（例如机房停电）。当然 实现这个功能的代价就是性能上的牺牲，在每次添加删除数据的时候都要扫描所有的组，在get数据的时候会随机选择一组服务器开始轮询，一直到找到数据为 止，正常情况下一次就可以获取得到。
BSM_Memcache只支持这几个函数：
CODE:

```

zend_function_entry bsm_memcache_functions[] =
{
PHP_FE(mc_get,          NULL)
PHP_FE(mc_set,          NULL)
PHP_FE(mc_del,          NULL)
PHP_FE(mc_add_group,    NULL)
PHP_FE(mc_add_server,   NULL)
PHP_FE(mc_shutdown,     NULL)
{NULL, NULL, NULL}
};

```

mc_add_group函数返回一个整形（其实应该是一个object，我偷懒了~_~）作为组ID，mc_add_server的时候要提供两个参数，一个是组ID，一个是服务器地址（ADDRORT）。
CODE:

```

/**
* Add a server group
*/
PHP_FUNCTION(mc_add_group)
{
apr_int32_t group_id;
apr_status_t rv;if (0 != ZEND_NUM_ARGS())
{
WRONG_PARAM_COUNT;
RETURN_NULL();
}
 
group_id = free_group_id();
if (-1 == group_id)
{
RETURN_FALSE;
}
 
apr_memcache_t *mc;
rv = apr_memcache_create(p, MAX_G_SERVER, 0, &mc);
 
add_group(group_id, mc);
 
RETURN_DOUBLE(group_id);
}
CODE:
/**
* Add a server into group
*/
PHP_FUNCTION(mc_add_server)
{
apr_status_t rv;
apr_int32_t group_id;
double g;
char *srv_str;
int srv_str_l;if (2 != ZEND_NUM_ARGS())
{
WRONG_PARAM_COUNT;
}
 
if (zend_parse_parameters(ZEND_NUM_ARGS() TSRMLS_CC, “ds”, &g, &srv_str, &srv_str_l) == FAILURE)
{
RETURN_FALSE;
}
 
group_id = (apr_int32_t) g;
 
if (-1 == is_validate_group(group_id))
{
RETURN_FALSE;
}
 
char *host, *scope;
apr_port_t port;
 
rv = apr_parse_addr_port(&host, &scope, &port, srv_str, p);
if (APR_SUCCESS == rv)
{
// Create this server object
apr_memcache_server_t *st;
rv = apr_memcache_server_create(p, host, port, 0, 64, 1024, 600, &st);
if (APR_SUCCESS == rv)
{
if (NULL == mc_groups[group_id])
{
RETURN_FALSE;
}
 
// Add server
rv = apr_memcache_add_server(mc_groups[group_id], st);
 
if (APR_SUCCESS == rv)
{
RETURN_TRUE;
}
}
}
 
RETURN_FALSE;
}

```

在set和del数据的时候，要循环所有的组：
CODE:

```

/**
* Store item into all groups
*/
PHP_FUNCTION(mc_set)
{
char *key, *value;
int key_l, value_l;
double ttl = 0;
double set_ct = 0;if (2 != ZEND_NUM_ARGS())
{
WRONG_PARAM_COUNT;
}
 
if (zend_parse_parameters(ZEND_NUM_ARGS() TSRMLS_CC, “ss|d”, &key, &key_l, &value, &value_l, ttl) == FAILURE)
{
RETURN_FALSE;
}
 
// Write data into every object
apr_int32_t i = 0;
if (ttl < 0)
{
ttl = 0;
}
 
apr_status_t rv;
 
for (i = 0; i < MAX_GROUP; i++)
{
if (0 == is_validate_group(i))
{
// Write it!
rv = apr_memcache_add(mc_groups[i], key, value, value_l, (apr_uint32_t) ttl, 0);
if (APR_SUCCESS == rv)
{
set_ct++;
}
}
}
 
RETURN_DOUBLE(set_ct);
}

```

在mc_get中，首先要随机选择一个组，然后从这个组开始轮询：
CODE:

```

/**
* Random group id
* For mc_get()
*/
apr_int32_t random_group()
{
struct timeval tv;
struct timezone tz;
int usec;gettimeofday(&tv, &tz);
 
usec = tv.tv_usec;
 
int curr = usec % count_group();
 
return (apr_int32_t) curr;
}

```

BSM_Memcache的使用方式和其它的client类似：
CODE:

```

<?php
$g1 = mc_add_group();    // 添加第一个组
$g2 = mc_add_group();    // 添加第二个组
mc_add_server($g1, ‘localhost:11211′);    // 在第一个组中添加第一台服务器
mc_add_server($g1, ‘localhost:11212′);    // 在第一个组中添加第二台服务器
mc_add_server($g2, ‘10.0.0.16:11211′);    // 在第二个组中添加第一台服务器
mc_add_server($g2, ‘10.0.0.17:11211′);    // 在第二个组中添加第二台服务器 mc_set(‘key’, ‘Hello’);    // 写入数据
$key = mc_get(‘key’);    // 读出数据
mc_del(‘key’);    // 删除数据
mc_shutdown();    // 关闭所有组
?>

```

APR_Memcache的相关资料可以在这里找到，BSM_Memcache可以在本站下载。
◎APR环境介绍
APR的全称：Apache Portable Runtime。它是Apache软件基金会创建并维持的一套跨平台的C语言库。它从Apache httpd1.x中抽取出来并独立于httpd之外，Apache httpd2.x就是建立在APR上。APR提供了很多方便的API接口可供使用，包括如内存池、字符串操作、网络、数组、hash表等实用的功能。开发 Apache2 Module要接触很多APR函数，当然APR可以独立安装独立使用，可以用来写自己的应用程序，不一定是Apache httpd的相关开发。
◎后记
这是我在农历丙戌年（我的本命年）的最后一篇文章，由于Memcached的内涵很多，仓促整理一定有很多遗漏和错误。感谢新浪网提供的研究机会，感谢部门同事的帮助。
