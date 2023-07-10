---
layout: page

title: Memcached学习笔记
category: redis
categoryStr: 分布式
tags: chache
keywords: 
description: 
---


学习的几个网址：
http://kb.cnblogs.com/page/42731/
先弄清楚几个问题

1.什么是memcached

memcached是一套分布式的快取系统。 memcached是高性能的分布式内存缓存服务器。 一般的使用目的是，通过缓存数据库查询结果，减少数据库访问次数，以提高动态Web应用的速度、 提高可扩展性。


2.它的作用，解决的问题

 许多Web应用都将数据保存到RDBMS中，应用服务器从中读取数据并在浏览器中显示。 但随着数据量的增大、访问的集中，就会出现RDBMS的负担加重、数据库响应恶化、 网站显示延迟等重大影响。 这时就该memcached大显身手了。




3.它的原理

 memcached的API使用三十二位元的循环冗余校验（CRC-32）计算键值后，将资料分散在不同的机器上。当表格满了以后，接下来新增的资料会以 LRU机制替换掉。由于memcached通常只是当作快取系统使用，所以使用memcached的应用程式在写回较慢的系统时（像是后端的数据库）需要 额外的程式码更新memcached内的资料。


CRC-32是什么，LRU是什么。


4.它的特点特征

memcached作为高速运行的分布式缓存服务器，具有以下的特点。

协议简单

基于libevent的事件处理

内置内存存储方式

memcached不互相通信的分布式

协议简单


memcached的服务器客户端通信并不使用复杂的XML等格式， 而使用简单的基于文本行的协议。因此，通过telnet 也能在memcached上保存数据、取得数据


基于libevent的事件处理


libevent是个程序库，它将Linux的epoll、BSD类操作系统的kqueue等事件处理功能 封装成统一的接口。即使对服务器的连接数增加，也能发挥O(1)的性能。 memcached使用这个libevent库，因此能在Linux、BSD、Solaris等操作系统上发挥其高性能。


内置内存存储方式


为了提高性能，memcached中保存的数据都存储在memcached内置的内存存储空间中。 由于数据仅存在于内存中，因此重启memcached、重启操作系统会导致全部数据消失。 另外，内容容量达到指定值之后，就基于LRU(Least Recently Used)算法自动删除不使用的缓存。

memcached不互相通信的分布式


memcached尽管是“分布式”缓存服务器，但服务器端并没有分布式功能。 各个memcached不会互相通信以共享信息。那么，怎样进行分布式呢？ 这完全取决于客户端的实现




4.如何安装，部署，使用

运行memcached需要本文开头介绍的libevent库

memcached安装与一般应用程序相同，configure、make、make install就行了。

```

$ wget http://www.danga.com/memcached/dist/memcached-1.2.5.tar.gz
$ tar zxf memcached-1.2.5.tar.gz
$ cd memcached-1.2.5
$ ./configure
$ make
$ sudo make install

```

保存数据


向memcached保存数据的方法有

```
add
replace
set

```

它们的使用方法都相同：

```

my $add = $memcached->add( '键', '值', '期限' );
my $replace = $memcached->replace( '键', '值', '期限' );
my $set = $memcached->set( '键', '值', '期限' );

```

保存数据

```

选项	说明
add	仅当存储空间中不存在键相同的数据时才保存
replace	仅当存储空间中存在键相同的数据时才保存
set	与add和replace不同，无论何时都保存

```

获取数据

获取数据可以使用get和get_multi方法。

```

my $val = $memcached->get('键');
my $val = $memcached->get_multi('键1', '键2', '键3', '键4', '键5');

```

删除数据

删除数据使用delete方法，不过它有个独特的功能。

$memcached->delete('键', '阻塞时间(秒)');

删除第一个参数指定的键的数据。第二个参数指定一个时间值，可以禁止使用同样的键保存新数据。 此功能可以用于防止缓存数据的不完整。但是要注意，set函数忽视该阻塞，照常保存数据

增一和减一操作

可以将memcached上特定的键值作为计数器使用。

```

my $ret = $memcached->incr('键');
$memcached->add('键', 0) unless defined $ret;

```

增一和减一是原子操作，但未设置初始值时，不会自动赋成0



5.内存存储方式

 本次将介绍memcached的内部构造的实现方式，以及内存的管理方式。 memcached的内部构造导致的弱点也将加以说明。 
Slab Allocation机制：整理内存以便重复使用

 在该机制出现以前，内存的分配是通过对所有记录简单地进行malloc和free来进行的。 但是，这种方式会导致内存碎片，加重操作系统内存管理器的负担，

Slab Allocator的基本原理是按照预先规定的大小，将分配的内存分割成特定长度的块， 以完全解决内存碎片问题。

Slab Allocation的原理相当简单。 将分配的内存分割成各种尺寸的块（chunk）， 并把尺寸相同的块分成组（chunk的集合）

 

 slab allocator还有重复使用已分配的内存的目的。 也就是说，分配到的内存不会释放，而是重复利用。
Page

分配给Slab的内存空间，默认是1MB。分配给Slab之后根据slab的大小切分成chunk。

Chunk

用于缓存记录的内存空间。
Slab Class

特定大小的chunk的组。

在Slab中缓存记录的原理

 memcached根据收到的数据的大小，选择最适合数据大小的slab（图2）。 memcached中保存着slab内空闲chunk的列表，根据该列表选择chunk， 然后将数据缓存于其中。
主要都是为了避免内存碎片，已经资源的浪费，因为内存是一种非常昂贵的资源。
Slab Allocator解决了当初的内存碎片问题，但新的机制也给memcached带来了新的问题。

这个问题就是，由于分配的是特定长度的内存，因此无法有效利用分配的内存

 chunk空间的使用
 就是说，如果预先知道客户端发送的数据的公用大小，或者仅缓存大小相同的数据的情况下， 只要使用适合数据大小的组的列表，就可以减少浪费。


6.调优
使用Growth Factor进行调优


memcached在启动时指定 Growth Factor因子（通过-f选项）， 就可以在某种程度上控制slab之间的差异。默认值为1.25。 但是，在该选项出现之前，这个因子曾经固定为2，称为“powers of 2”策略。



5.同类产品之间的比较
8.为了节省空间，如果都是设置的128KB,但是来了一个256的东西，怎么搞？这样就设计到设置256的区间有多少个，多大，这样最终还是设计到统计以及算法的问题。
 将memcached引入产品，或是直接使用默认值进行部署时， 最好是重新计算一下数据的预期平均长度，调整growth factor， 以获得最恰当的设置。内存是珍贵的资源，浪费就太可惜了。

6.
查看memcached的内部状态



$ telnet 主机名 端口号

连接到memcached之后，输入stats再按回车，

此外，输入"stats slabs"或"stats items"还可以获得关于缓存记录的信息。
7.删除机制和发展方向

以及memcached的最新发展方向——二进制协议（Binary Protocol） 和外部引擎支持。
Lazy Expiration


memcached内部不会监视记录是否过期，而是在get时查看记录的时间戳，检查记录是否过期。 这种技术被称为lazy（惰性）expiration。因此，memcached不会在过期监视上耗费CPU时间。
LRU：从缓存中有效删除数据的原理


memcached会优先使用已超时的记录的空间，但即使如此，也会发生追加新记录时空间不足的情况， 此时就要使用名为 Least Recently Used（LRU）机制来分配空间。 顾名思义，这是删除“最近最少使用”的记录的机制。 因此，当memcached的内存空间不足时（无法从slab class 获取到新的空间时），就从最近未被使用的记录中搜索，并将其空间分配给新的记录。 从缓存的实用角度来看，该模型十分理想。

关于二进制协议


使用二进制协议的理由是它不需要文本协议的解析处理，使得原本高速的memcached的性能更上一层楼， 还能减少文本协议的漏洞


占据了16字节的头部(HEADER)分为 请求头（Request Header）和响应头（Response Header）两种。 头部中包含了表示包的有效性的Magic字节、命令种类、键长度、值长度等信息

外部引擎支持的必要性


世界上有许多memcached的派生软件，其理由是希望永久保存数据、实现数据冗余等， 即使牺牲一些性能也在所不惜

memcached支持外部存储的难点是，网络和事件处理相关的代码（核心服务器）与 内存存储的代码紧密关联。这种现象也称为tightly coupled（紧密耦合）。 必须将内存存储的代码从核心服务器中独立出来，才能灵活地支持外部引擎。


让memcached进行并行控制（concurrency control）的方案是最为容易的， 但是对于引擎而言，并行控制正是性能的真谛，因此我们采用了将多线程支持完全交给引擎的设计方案。

至于memcached的分布式，则是完全由客户端程序库实现的。 这种分布式是memcached的最大特点。

这里还涉及到一个很重要的问题，就是键值对的值的长度。已经不同的机器上面空间的分配，还有一点是如果按照这个算法其他的内存上已经写满了怎么搞？
Cache::Memcached的分布式方法

Cache::Memcached的分布式方法简单来说，就是“根据服务器台数的余数进行分散”。 求得键的整数哈希值，再除以服务器台数，根据其余数来选择服务器。

多说一句，当选择的服务器无法连接时，Cache::Memcached会将连接次数 添加到键之后，再次计算哈希值并尝试连接。这个动作称为rehash


余数计算的方法简单，数据的分散性也相当优秀，但也有其缺点。 那就是当添加或移除服务器时，缓存重组的代价相当巨大。 添加服务器后，余数就会产生巨变，这样就无法获取与保存时相同的服务器， 从而影响缓存的命中率

这种分布式方法称为 Consistent Hashing
mixi案例研究

随着网站访问量的急剧增加，单纯为数据库添加slave已无法满足需要，因此引入了memcached



