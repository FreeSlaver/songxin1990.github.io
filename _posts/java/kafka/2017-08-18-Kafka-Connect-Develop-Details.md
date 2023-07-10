---
layout: page

title: Kafka Connect开发教程
category: kafka
categoryStr: 大数据
tags: kafka
keywords: [kafka connect,kafka,教程]
description: Kafka Connect开发详解，详细
---

<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Kafka Connect开发教程</a>
<ul>
<li><a href="#sec-1-1">1.1. Core Concepts 核心概念</a>
<ul>
<li><a href="#sec-1-1-1">1.1.1. Connectors</a></li>
<li><a href="#sec-1-1-2">1.1.2. Tasks</a></li>
<li><a href="#sec-1-1-3">1.1.3. Workers</a></li>
</ul>
</li>
<li><a href="#sec-1-2">1.2. 具体实现</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. 新建项目，添加依赖</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. 注意事项</a></li>
<li><a href="#sec-1-4">1.4. 参考</a></li>
</ul>
</li>
</ul>
</div>
</div>



不得不吐槽下Kafka的官方文档写的不够详细，可能他们需要干的事情太多了，无暇顾及。  
看本文之前请先阅读：[Kafka Connect Details 详解](/bigdata/Kafka-Connect-Details.html) 。  

## Core Concepts 核心概念<a id="sec-1-1" name="sec-1-1"></a>

### Connecttors<a id="sec-1-1-1" name="sec-1-1-1"></a>

Kafka Connect分2种，一种是Source Connector，一种是Sink Connector。  
Source将数据从第三方系统导入到Kafka；Sink将Kafka中的数据导出到第三方系统。  

Connector主要是接收配置文件，然后将配置文件传递给Task。  
并且将工作（job）分解成任务（task）交给Task去执行。  

### Tasks<a id="sec-1-1-2" name="sec-1-1-2"></a>

Task也分2种，SourceTask和SinkTask。  
主要工作就是将Connector分配给的数据集合，进行处理，转换，输出。  
SourceTask使用的pull拉的方式，SinkTask使用的push推的方式。  
它们处理的都是Record的子类，Record包含topics，partition，offset，key和value信息。  
**Task是无状态的，不需要处理offset等信息，这些是由Connector来处理的。**    
这样的话，就能基于在Task层面横向扩展。

### Workers<a id="sec-1-1-3" name="sec-1-1-3"></a>

Connector和Task是逻辑单元，一个Worker对应一个进程，包含Connector和Tasks。  
在分布式模式下，是在Worker层面进行failover的处理的。  

## 具体实现<a id="sec-1-2" name="sec-1-2"></a>

只需要实现2个抽象类，一个是Connector，一个是Task。  
Sourcer要实现SourceConnector和SourceTask。  
Sinker要实现SinkConnector和SinkTask。  

具体代码怎么写，可以参考源代码中file包目录下的FileStreamSourceTask和FileStreamSinkTask，  
或者参看我的Github项目：[maxwell-sink](https://github.com/songxin1990/maxwell-sink)。    
其实Kafka Connect本质就是包了一层的producer和consumer。  

### 新建项目，添加依赖<a id="sec-1-2-1" name="sec-1-2-1"></a>

1.新建maven项目，添加依赖：
```
<dependency>
          <groupId>org.apache.kafka</groupId>
          <artifactId>connect-api</artifactId>
          <version>0.10.1.1</version>
          <!--<version>0.11.0.0</version>-->
 </dependency>
 ```
 
 这里的版本最好保持和线上Kafka Brokers集群的版本一致。  
 这里要提下的是0.11.0.0版本的Kafka实现了exactly once消息投递语义，还是非常强大的。  

1.  添加maven assembly plugin  
    因为我们最终要将实现的Connector作为插件打包成jar，部署到Kafka Broker机器上。  
    要注意的是：connector的依赖jar包，不要kafka的运行时相应jar包有版本冲突。  

2.  继承并实现抽象类  
3.  打包，部署  
    详情请参看：[Kafka Connect Deploy 部署](/Kafka-Connect-Deploy.html)  

## 注意事项<a id="sec-1-3" name="sec-1-3"></a>

这里我说几点要注意的：  
1.  Sink Connector中不需要自己提交offset，但是要保证put方法中得到的records集合的处理，要么全部成功，要么全部失败  
    ```
    @Override
    public void put(final Collection<SinkRecord> records) {
    
    }
    ```
    特别是在做JDBC的batch的时候，有可能将一次records分成多个batch，必须要保证在所有batch执行完后，  
    再设置connection.commit()，而不是每次batch之后就commit了。

2. 顺序性  
maxwell使用的主键hash策略，所以能够保证相同primary key值的记录的所有增删改产生的消息都hash到相同的partition上去，  
而且我们知道一个partiton只会被分配到一个task上去（也就是一个消费者），所以不会有乱序的问题。  

3. version()方法  
不太重要，反正我直接用的"1.0.0"。

## 相关推荐文章
[Apache Kafka技术分享](/bigdata/Kafka-Share.html)  
[使用Maxwell Kafka和Maxwell-Sink进行MySql数据同步](/bigdata/MySql-ETL-Using-Maxwell-Kafka-MaxwellSink.html)   
[Kafka消息投递语义-消息不丢失，不重复，不丢不重](/bigdata/Kafka-Message-Delivery-Semantics.html)   
[Kafka Connect详解](/bigdata/Kafka-Connect-Details.html)
## 参考<a id="sec-1-4" name="sec-1-4"></a>

[8.3 Connector Development Guide](https://kafka.apache.org/documentation/#connect_development)  
[Kafka Concepts](http://docs.confluent.io/current/connect/concepts.html)  
