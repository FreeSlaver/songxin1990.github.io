---
layout: page
breadcrumb: true
title: 日志系统总结
category: trash
categoryStr: 废弃
tags: 
keywords: 
description: 
---

<span style="color:red">**废弃**</span><br/>
优点：

1. 将整个系统切分2个子系统，将日志接收方和日志消费方分离，可以很好的对接收方或消费方横向扩展。
并且这本身就是2个不同的功能模块，也可以分别针对进行调优，重构等。
2. 对不同业务类型的日志使用不同的handler进行处理，清洗，得到有价值的，自己需要的数据，并进行沉淀。
3. plugin这种注册机制非常灵活，可以进行热插播。

废弃原因：
1. 日志这种价值不大的数据不应该用redis这种耗费贵内存的东西来操作。如果为了消峰，完全可以用缓冲，batch，同时写多个文件做到。
2. redis的pull消费模式是一条条的，对于这种大量并发的数据，太慢，容易将redis撑爆，而使用redis的程序有无法控制，结果不可想象。
还有一点就是push出去，需要另外开个端口，搞ServerSocket纯手动的服务器，这让gateway不堪重负啊，任何一个的崩溃，down机，服务都不可用。
3. 相对于PB，不如直接使用纯文本的JSON，textual的好处，谁用谁知道。

将之前做的日志系统做一个总结。日志系统分成2个工程，一个是deplog-gateway，一个是deplog-handler。

### deplog-gateway ：

gateway 负责接受异步发送过来的日志，然后将日志PUSH到Redis中，使用List数据结构存储，另外会在开辟一个端口，监听handler发送过来的请求，将日志PULL下来，然后推送给handler。

监听日志请求使用的是Netty做的一个HTTP服务器，日志传输使用Google Protobuf，队列使用的Redis，使用Jedis来操作。然后监听handler的请求使用的是ServerSocket加线程池，所有通信都是使用异步的。



### deplog-handler ：

handler负责从Redis中拉取日志数据，并将日志进行清洗，将日志分流到不同的数据类型，之后存储到ES中不同的索引表中。后续将日志存取到HBase中，进行日志的分析等工作。

每一种日志类型都对应一个PB对象，然后都有他自己的Plugin和Processor。Plugin指定自己当前处理的日志类型，然后将自身注册到PluginManager中，这样的方式支持日志类型的热插播。

使用Processor进行日志内容提取，对象生成。

ES使用了ES的java lib，使用bulk方式批量存储数据，然后加上了shield权限控制。

所有的拉取日志，日志分流，分析都是使用的多线程。


2个项目都使用了JMX来进行在线数据的统计，监控。使用Redis自身集群技术进行集群，然后gateway和handler都是多个实例，集群部署，前端使用Ngnix分发日志，

gateway和多个handler之间通信，gateway只是一种被动的响应多个handler的日志请求。

### 项目学到的技术要点：
1.Google Protobuf的配置，使用
2.ES的操作和使用
3.Redis的操作和使用
4.handler中插件热插播的原理和实现。
