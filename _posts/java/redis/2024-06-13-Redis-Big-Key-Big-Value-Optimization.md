---
layout: page
title: Redis大key大value如何做优化？
category: redis
tags:
keywords:
description:
---

Redis大key大value，应该就是那些一个key对应的value占据的内存空间过大的情况，这种情况应该分几种情况进行处理。
1.对value进行分而治之，分段，将一个key分解成多个key，每个key对应到一小段value。
2.单个value对象过大，先看value对象中的所有字段都有缓存的必要吗？是不是只缓存那几个经常访问的字段
3.value分情况来看的话，有可能是string，list，hash，set，zset这几个常见的数据结构中的一种，
大string长文本需要经常访问的情况较少，可以忽略。如果真有，可以直接写死在配置文件中，如果又大又经常变动，而且被频繁访问的话，这种一般少见。
如果是list，就可以将一个list分割成多个小的list，从redis中读取后再进行合并。
如果是hash，一般是存对象，也可以分割，分成多个hash。


生产环境中遇到过多次因业务删除大Key，导致Redis阻塞，出现故障切换和应用程序雪崩的故障。
3. 大key产生的原因
   业务设计不合理。这是最常见的原因，不应该把大量数据存储在一个key中，而应该分散到多个key。例如：把全国数据按照省行政区拆分成34个key，或者按照城市拆分成300个key，可以进一步降低产生大key的概率。
   没有预见value的动态增长问题。如果一直添加value数据，没有删除机制、过期机制或者限制数量，迟早出现大key。例如：微博明星的粉丝列表、热门评论等。
   过期时间设置不当。如果没有给某个key设置过期时间，或者过期时间设置较长。随着时间推移，value数量快速累积，最终形成大key。
   程序bug。某些异常情况导致某些key的生命周期超出预期，或者value数量异常增长 ，也会产生大key。


4. 怎样排查大key

4.1 SCAN命令
通过使用Redis的SCAN命令，我们可以逐步遍历数据库中的所有Key。结合其他命令（如STRLEN、LLEN、SCARD、HLEN等），我们可以识别出大Key。SCAN命令的优势在于它可以在不阻塞Redis实例的情况下进行遍历。

4.2 bigkeys参数
使用redis-cli命令客户端，连接Redis服务的时候，加上  —bigkeys 参数，可以扫描每种数据类型数量最大的key。

redis-cli -h 127.0.0.1 -p 6379 —bigkeys

4.3 Redis RDB Tools工具
使用开源工具Redis RDB Tools，分析RDB文件，扫描出Redis大key。

例如：输出占用内存大于1kb，排名前3的keys。

rdb —commond memory —bytes 1024 —largest 3 dump.rbd

5. 怎么解决大key
   拆分成多个小key。这是最容易想到的办法，降低单key的大小，读取可以用mget批量读取。
   数据压缩。使用String类型的时候，使用压缩算法减少value大小。或者是使用Hash类型存储，因为Hash类型底层使用了压缩列表数据结构。
   设置合理的过期时间。为每个key设置过期时间，并设置合理的过期时间，以便在数据失效后自动清理，避免长时间累积的大Key问题。
   启用内存淘汰策略。启用Redis的内存淘汰策略，例如LRU（Least Recently Used，最近最少使用），以便在内存不足时自动淘汰最近最少使用的数据，防止大Key长时间占用内存。
   数据分片。例如使用Redis Cluster将数据分散到多个Redis实例，以减轻单个实例的负担，降低大Key问题的风险。
   删除大key。使用UNLINK命令删除大key，UNLINK命令是DEL命令的异步版本，它可以在后台删除Key，避免阻塞Redis实例。
6. 



















