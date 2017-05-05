---
layout: post
title: 日志系统总结
category: 技术
tags: log
keywords: 
description: 
---


将之前做的日志系统做一个总结。日志系统分成2个工程，一个是deplog-gateway，一个是deplog-handler。

### deplog-gateway ：

gateway 负责接受异步发送过来的日志，然后将日志PUSH到Redis中，使用List数据结构存储，另外会在开辟一个端口，监听handler发送过来的请求，将日志PULL下来，然后推送给handler。

监听日志请求使用的是Netty做的一个HTTP服务器，日志传输使用Google Protobuf，队列使用的Redis，使用Jedis来操作。然后监听handler的请求使用的是ServerSocket加线程池，所有通信都是使用异步的。



### deplog-handler ：
handler负责从Redis中拉取日志数据，并将日志进行清洗，将日志分流到不同的数据类型，之后存储到ES中不同的索引表中。后续将日志存取到HBase中，进行日志的分析等工作。

每一种日志类型都对应一个PB对象，然后都有他自己的Plugin和Processor。Pugin是指定自己当前处理的日志类型，然后将自身注册到PluginManager中，这样的方式支持日志类型的热插播。

使用Processor进行日志内容提取，对象生成。

ES使用了ES的java util，一般使用bulk方式批量存储数据，然后加上了shield权限控制。

所有的拉取日志，日志分流，分析都是使用的多线程。


2个项目都使用了JMX来进行在线数据的统计，监控。使用Redis自身集群技术进行集群，然后gateway和handler都是多个实例，集群部署，前端使用Ngnix分发日志，gateway和多个handler之间通信，gateway只是一种被动的响应多个handler的日志请求。

### 项目学到的技术要点：
1.Google Protobuf的配置，使用
2.ES的操作和使用
3.Redis的操作和使用
4.handler中插件热插播的原理和实现。
