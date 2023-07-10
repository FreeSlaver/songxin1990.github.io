---
layout: page

title: Zipkin笔记
category: distribute
categoryStr: 分布式
tags: [dapper,zipkin,brave,note]
keywords: [dapper,zipkn,brave]
description: 
---

<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Zipkin笔记</a>
<ul>
<li><a href="#sec-1-1">1.1. 安装部署</a></li>
<li><a href="#sec-1-2">1.2. 架构</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. 架构概览</a></li>
<li><a href="#sec-1-2-2">1.2.2. 工作例子流</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. 数据模型</a>
<ul>
<li><a href="#sec-1-3-1">1.3.1. Annotation：数据模型中的</a></li>
</ul>
</li>
<li><a href="#sec-1-4">1.4. 实现三方库</a>
<ul>
<li><a href="#sec-1-4-1">1.4.1. 概览</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>



Zipkin是一个分布式追踪系统，根据Google的Dapper论文来的。主要用于分布式系统延时和故障追踪，分析。

## 安装部署<a id="sec-1-1" name="sec-1-1"></a>

可以通过Docker，Java，Source来安装。  
Java8以上版本，安装：  
wget -O zipkin.jar 'https://search.maven.org/remote<sub>content</sub>?g=io.zipkin.java&a=zipkin-server&v=LATEST&c=exec'  
java -jar zipkin.jar  

浏览器输入<http://your_host:9411访问控制台界面>。

## 架构<a id="sec-1-2" name="sec-1-2"></a>

### 架构概览<a id="sec-1-2-1" name="sec-1-2-1"></a>

Span：当一个操作发生时，比如Server接受到一个HTTP请求，会记录：接收时间，traceId，spanId，parentId等之类的东西构成Span。  

Reporter：将Span发送给Zipkin Server的组件成为Reporter，一般是一个异步HTTP发送装置。  

identifiers are sent in-band and details are sent out-of-band to Zipkin.（标记是带内传输，详情通过带外）  
标记是诸如：TraceId，SpanId这些东西。详情就是具体的Span内容。  

Zipkin由4个组件构成：Collector，Storage，Search（QueryService），WebUI。  
存储使用Cassandra，但是是可插播的，也支持ES,MySQL。  
![img](/img/life/2018-02-26-Zipkin-Note-1.png)  

### 工作例子流<a id="sec-1-2-2" name="sec-1-2-2"></a>

![img](/img/life/2018-02-26-Zipkin-Note-2.png)

## 数据模型<a id="sec-1-3" name="sec-1-3"></a>

-   inbound and outbound requests are in different spans（带内和带外的请求在不同的span中）
-   spans that include cs can log an sa annotation of where they are going（包含cs的span可以用sa标记他们请求的地址）
-   This helps when the destination protocol isn’t Zipkin instrumented, such as MySQL.

### Annotation：数据模型中的<a id="sec-1-3-1" name="sec-1-3-1"></a>

-   cs - Client Send. The client has made the request. This sets the beginning of the span.
-   sr - Server Receive: The server has received the request and will start processing it. The difference between this and cs will be combination of network latency and clock jitter.
-   ss - Server Send: The server has completed processing and has sent the request back to the client. The difference between this and sr will be the amount of time it took the server to process the request.
-   cr - Client Receive: The client has received the response from the server. This sets the end of the span. The RPC is considered complete when this annotation is recorded.

举个例子，客户端发起/foo的HTTP请求，这时就是cs，等服务端接收到/foo的请求，记录sr；等服务器返回响应，记录ss；等客户端接收到响应，记录cr。  
还可以提供一些其他的标记，比如记录一下Server端一个很重的计算操作耗时。  
BinaryAnnotation
提供一些额外的记录信息，比如请求的URL。

in order to reassemble a complete trace. Five pieces of information are required:
-   Trace Id
-   Span Id
-   Parent Id
-   Sampled - Lets the downstream service know if it should record trace information for the request.
-   Flags - Provides the ability to create and communicate feature flags. This is how we can tell downstream services that this is a “debug” request.

重新装载一个完成的跟踪信息，以下5条是必需的。  

## 实现三方库<a id="sec-1-4" name="sec-1-4"></a>

### 概览<a id="sec-1-4-1" name="sec-1-4-1"></a>

实现一个Zipkin的三方库，必须先了解以下内容：
1.  核心数据结构-哪些信息需要被收集和发送到Zipkin Server
2.  跟踪标识符-需要那些标记信息才能构建组装一个逻辑顺序链
    1.  生成标识符-如何生成这些ID，那些ID要背继承下去
    2.  如何添加额外信息
3.  时间戳和耗时-如何记录操作的耗时信息
