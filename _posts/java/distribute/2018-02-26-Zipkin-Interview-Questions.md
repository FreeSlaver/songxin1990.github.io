---
layout: page

title: Zipkin面试题
category: distribute
categoryStr: 分布式
tags: [dapper,zipkin,brave,interview]
keywords: [dapper,zipkn,brave,interview]
description: 
---
<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Zipkin面试题</a>
<ul>
<li><a href="#sec-1-1">1.1. 说说Zipkin是个什么东西，主要用来解决什么问题</a></li>
<li><a href="#sec-1-2">1.2. Zipkin的整个工作流程</a></li>
<li><a href="#sec-1-3">1.3. 部署Zipkin对业务性能有影响吗，为什么</a></li>
<li><a href="#sec-1-4">1.4. TraceID是如何生成的，怎么保证全局唯一？</a></li>
<li><a href="#sec-1-5">1.5. 分布式追踪能记录内核信息吗，对于消息队列这种如何追踪了？</a></li>
</ul>
</li>
</ul>
</div>
</div>

# Zipkin面试题<a id="sec-1" name="sec-1"></a>

## 说说Zipkin是个什么东西，主要用来解决什么问题<a id="sec-1-1" name="sec-1-1"></a>

Zipkin是Twitter的一个分布式系统追踪框架，根据Google Dapper论文来实现的，Java语言的实现框架是Brave。  
主要是用来追踪一次请求在整个分布式系统中的各环节调用链，以此来推断系统的行为表现和各环节性能耗时。  
举个例子来说：我们使用Google进行一次搜索，关键词会在集群不同机器上的索引文件中进行查询，最后合并结果。  
并且在整个过程中，还有拼写纠错，图片查询，根据用户偏向展示结果等其他RPC调用，而且用户对延时非常敏感，  
所以我们需要Zipkin这种分布式追踪框架来记录各个阶段调用的耗时和异常情况推断哪个环节出错。  

## Zipkin的整个工作流程<a id="sec-1-2" name="sec-1-2"></a>

Zipkin大致可以分为3个环节：1. Span记录产生；2. Span记录收集；3. Span记录展示和查询。  

### 记录产生阶段
Zipkin主要用于线程内，RPC调用，HTTP调用中等进行记录，以HTTP为例，  
客户端发送请求，每次请求对应一个新的traceId，全局唯一，然后server端接受，处理，返回请求给客户端。  
整个过程产生4个Span，可以使用异步HTTP的方式发给Zipkin Server，也可以使用写本地日志的方式记录。  

### 收集阶段：
如果是HTTP异步发送，Zipkin Server就能接受后存入mysql或者其他存储中，  
如果是写本地日志，就需要另外的工具进行收集，然后通过Zipkin的Rest Api写入到Mysql中。  

### 记录展示和查询：
通过Zipkin UI进行展示，我们可以通过TraceId来查询一次请求的整个调用链，或者通过Span名称查询相关业务的Span。 

## 部署Zipkin对业务性能有影响吗，为什么<a id="sec-1-3" name="sec-1-3"></a>

在整个设计之初，低消耗就是设计目标之一，我们前面说了可以用本地异步写日志或者HTTP异步发送的方式。  
而且每个Span的产生大约在200纳秒耗时左右，因此产生阶段的性能影响可以忽略。  
但是如果面对大量的高并发请求，我们可以通过设置Sample，采样率来降低拦截次数，因此也能将影响控制住。  

## TraceID是如何生成的，怎么保证全局唯一？<a id="sec-1-4" name="sec-1-4"></a>

首先获取不同的平台，是JDK7还是JDK6，是JDK7使用ThreadLocalRandom类生成，6的话，使用random类生成。  
以当前的系统的nanoTime为种子。  

## 分布式追踪能记录内核信息吗，对于消息队列这种如何追踪了？<a id="sec-1-5" name="sec-1-5"></a>

对于内核的状态信息不太好记录，但是能记录用户态的信息，然后添加到Span的Annotation中。  
消息队列中一条消息消费有可能是1对多，所以在整个追踪树产生的过程中，可能会有很多个中间的Span并列，  
而且异步的消息队列，生产者得到消息接受成功就算链接完成了。而消费者是另外的一个逻辑流程，所以想把  
消息生产到消息消费等整个流程串起来会有些问题。  
