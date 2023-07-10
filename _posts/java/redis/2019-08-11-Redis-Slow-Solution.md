---
layout: page

title: Redis性能优化变慢了怎么解决？
category: redis
categoryStr: redis
tags: [redis]
keywords:
description: Redis性能优化变慢了怎么解决？
---

也遇到过以下这些场景：
* 在 Redis 上执行同样的命令，为什么有时响应很快，有时却很慢？
* 为什么 Redis 执行 SET、DEL 命令耗时也很久？
* 为什么我的 Redis 突然慢了一波，之后又恢复正常了？
* 为什么我的 Redis 稳定运行了很久，突然从某个时间点开始变慢了？

<img src="/img/java/2019-08-11-Redis-Slow-Solution-1.jpg" class="post-img" alt="2019-08-11-Redis-Slow-Solution-1">


Redis基准性能测试
redis-cli -h 127.0.0.1 -p 6379 --intrinsic-latency 60

第一步，查 Redis 的慢日志（slowlog）。
# 命令执行耗时超过 5 毫秒，记录慢日志
CONFIG SET slowlog-log-slower-than 5000
# 只保留最近 500 条慢日志
CONFIG SET slowlog-max-len 500

SLOWLOG get 5

经常使用 O(N) 以上复杂度的命令，例如 SORT、SUNION、ZUNIONSTORE 聚合类命令
时间复杂度过高，要花费更多的 CPU 资源。一次需要返回给客户端的数据过多，更多时间花费在数据协议的组装和网络传输过程中。

操作bigkey， key 写入的 value 非常大，那么 Redis 在分配内存时就会比较耗时。同样的，当删除这个 key 时，释放内存也会比较耗时，这种类型的 key 我们一般称之为 bigkey。、
扫描 bigkey
redis-cli -h 127.0.0.1 -p 6379 --bigkeys -i 0.01
使用这个命令的原理，就是 Redis 在内部执行了 SCAN 命令，遍历整个实例中所有的 key，然后针对 key 的类型，分别执行 STRLEN、LLEN、HLEN、SCARD、ZCARD 命令，来获取 String 类型的长度、容器类型（List、Hash、Set、ZSet）的元素个数。

bigkey解决方案
1. 业务应用尽量避免写入 bigkey
2. 如果你使用的 Redis 是 4.0 以上版本，用 UNLINK 命令替代 DEL，此命令可以把释放 key 内存的操作，放到后台线程中去执行，从而降低对 Redis 的影响
3. 如果你使用的 Redis 是 6.0 以上版本，可以开启 lazy-free 机制（lazyfree-lazy-user-del = yes），在执行 DEL 命令时，释放内存也会放到后台线程中执行

缓存集中过期
某个时间点突然出现一波延时，其现象表现为：变慢的时间点很有规律，例如某个整点，或者每间隔多久就会发生一波延迟。

Redis淘汰策略需要根据具体的业务场景来配置。一般最常使用的是 allkeys-lru / volatile-lru 淘汰策略
当 Redis 在执行后台 RDB 和 AOF rewrite 时，采用 fork 子进程的方式来处理。但主进程 fork 子进程后，此时的主进程依旧是可以接收写请求的，而进来的写请求，会采用 Copy On Write（写时复制）的方式操作内存数据。
也就是说，主进程一旦有数据需要修改，Redis 并不会直接修改现有内存中的数据，而是先将这块内存数据拷贝出来，再修改这块新内存的数据，这就是所谓的「写时复制」。
写时复制你也可以理解成，谁需要发生写操作，谁就需要先拷贝，再修改。
这样做的好处是，父进程有任何写操作，并不会影响子进程的数据持久化（子进程只持久化 fork 这一瞬间整个实例中的所有数据即可，不关心新的数据变更，因为子进程只需要一份内存快照，然后持久化到磁盘上）。

<img src="/img/java/2019-08-11-Redis-Slow-Solution-2.jpg" class="post-img" alt="2019-08-11-Redis-Slow-Solution-2">

AOF 持久化提供了 3 种刷盘机制：
1. appendfsync always：
2. appendfsync no：
3. appendfsync everysec：主线程每次写操作只写内存就返回，然后由后台线程每隔 1 秒执行一次刷盘操作（触发fsync系统调用），此方案对性能影响相对较小，但当 Redis 宕机时会丢失 1 秒的数据

当 Redis 后台线程在执行 AOF 文件刷盘时，如果此时磁盘的 IO 负载很高，那这个后台线程在执行刷盘操作（fsync系统调用）时就会被阻塞住。
影响Redis的性能。，要警惕磁盘压力过大导致的 Redis 有性能问题。

我们在部署服务时，为了提高服务性能，降低应用程序在多个 CPU 核心之间的上下文切换带来的性能损耗，通常采用的方案是进程绑定 CPU 的方式提高性能。
Redis Server 除了主线程服务客户端请求之外，还会创建子进程、子线程。
其中子进程用于数据持久化，而子线程用于执行一些比较耗时操作，例如异步释放 fd、异步 AOF 刷盘、异步 lazy-free 等等。

Redis 在 6.0 版本已经推出了这个功能，我们可以通过以下配置，对主线程、后台线程、后台 RDB 进程、AOF rewrite 进程，绑定固定的 CPU 逻辑核心：
```bash
# Redis Server 和 IO 线程绑定到 CPU核心 0,2,4,6
server_cpulist 0-7:2

# 后台子线程绑定到 CPU核心 1,3
bio_cpulist 1,3

# 后台 AOF rewrite 进程绑定到 CPU 核心 8,9,10,11
aof_rewrite_cpulist 8-11

# 后台 RDB 进程绑定到 CPU 核心 1,10,11
# bgsave_cpulist 1,10-1
禁用Swap
通过以下方式来查看 Redis 进程是否使用到了 Swap：
# 先找到 Redis 的进程 ID
$ ps -aux | grep redis-server

# 查看 Redis Swap 使用情况
$ cat /proc/$pid/smaps | egrep '^(Swap|Size)'
```
但是，开启内存碎片整理，它也有可能会导致 Redis 性能下降。
原因在于，Redis 的碎片整理工作是也在主线程中执行的，当其进行碎片整理时，必然会消耗 CPU 资源，产生更多的耗时，从而影响到客户端的请求。

<img src="/img/java/2019-08-11-Redis-Slow-Solution-3.jpg" class="post-img" alt="2019-08-11-Redis-Slow-Solution-3">