---
layout: page

title: Spark项目总结
category: distribute
categoryStr: 分布式
tags: spark kafka
keywords: spark kafka 大数据
description: spark和kafka stream的项目demo总。
---

###Spark的特点
Spark适合那种大数据量，实时的进行map-reduce，大量运算的工程。
并不适合传统的业务项目，比如操作JDBC，各种Service等。因为这里涉及到状态的变跟和感知，
而Spark，Scala这些语言是无状态的，也就是函数编程。如果需要状态变更并感知，那么肯定就会使用到各种锁机制，导致
性能下降，以及各种并发的问题。

###Spark中的几个难点是：

driver中写的代码，生成的实例，怎么在worker中使用?
本来这个想法就不对，都是java开发过来的，需要共享全局的变量。但是这样会造成大量的并发锁，和资源浪费，可以见stackoverflow上的一个问题：http://stackoverflow.com/questions/28723340/shared-variables-with-spark
dirver要做的应该是负责worker的job和partition的分配等，而不应该关注数据。这样就能避免关注的数据
shard到worker上造成的共享变量，并发问题，也便于scala。

java编程的并发问题：比如使用一个db资源，需要保证在一个process方法（也就是一个线程）中都使用一个Connection。
不然你再process里面使用多个Connection，就会造成有些线程里面读取到的数据是脏数据。虽然一个JVM上面使用的一个实例的ConnectionPool，但是如果在process方法里面使用多个Connection就会出错。
而且要记得在结尾的地方close掉或者释放掉连接。

###下面是一个我的Spark Kafka和JDBC的项目。

<a href="http://7xtlm4.com1.z0.glb.clouddn.com/ticket.rar?attname=&e=1489227044&token=iW0qYJJiTzAzo6tK3XT0_PCcPcAtWXyvwgsd5Ed3:VorljIvzNKXi0iZxp9egKKZCa40">
项目下载</a>
