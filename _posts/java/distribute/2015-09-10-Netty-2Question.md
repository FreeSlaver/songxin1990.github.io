---
layout: page

title: Netty两个使用问题
category: opensource
categoryStr: distribute
tags: Netty Problem
keywords: 
description: 
---


### 问题一

您好，我在这里请教几个问题。 

第一 多个netty的实例你们一般用什么来做负载均衡的，通信协议是tcp。 

第二 netty的性能一般都是说很高，我这边也没有实际的测试过，不知道性能有没有一些生产数据提供呢？ netty的性能很好的话，你们是否用netty做中间件的开发呢？比如redis的代理，如果有，可否有一些经验说说，特别是gc那块。谢谢了


你问的问题非常好： 

1. 集群管理一般使用Zookeeper； 

2. Netty的性能数据官方有一个，你可以搜下netty performance，Trusting测试的，其它的跟业务场景相关，不便透漏； 

3. Netty有内存池，内存管理非常好； 

4. Netty的行业应用，建议你看下Dubbo。 

5. Netty的性能模型分析，我之前在infoQ有文章，你有空去看下。Netty高性能之道

集群管理建议使用Zookeeper。 路由策略建议使用软负载均衡SLB，内部服务间的路由可以有多种策略，例如随机、基于负载均衡、轮询等等。

### 问题二

Java7 已经实现了AIO了，Netty至今还在使用NIO，比起其它语言C++ asio、C#的 异步IO，Netty有和优势？而且编程模式还是基于传统的派生，如何结合Java 8 的闭包或者使用其它JVM语言（Scala）或许可以减低开发入门的难度，而且代码还简洁很多；有考虑过吗？

netty4的beta3加了AIO了，但是到beta9又被去了，作者的意思是测试下来AIO性能不如NIO，所以没必要用。我认为也没必要，在linux上NIO的实现本身就是epoll，使用jdk的AIO没有意义，在windows上jdk的AIO实现是IOCP，这种情况下使用AIO是比poll的性能高的，但是netty的服务器一般是在linux上，所以抛弃windows没啥大不了，windows最多做个客户端，用nio也就够了。另外，AIO无法使用sendto，就是zero copy的文件传输，这在做静态文件服务器是是个大的劣势。希望这个答案可以解决你的问题：不必纠结AIO


