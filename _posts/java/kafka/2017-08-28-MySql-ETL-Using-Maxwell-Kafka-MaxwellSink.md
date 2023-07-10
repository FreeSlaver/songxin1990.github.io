---
layout: page

title: 使用Maxwell Kafka做ETL同步Mysql
category: kafka
categoryStr: 大数据
tags: [essence kafka]
keywords: [maxwell,kafka,maxwell-sink,mysql,ETL,数据同步,教程]
description: 使用Maxwell，Kafka和Maxwell-Sink做ETL进行MySql数据同步，也可同步到其他数据仓库（如HDFS，ES等）。Maxwell-Sink功能包括：按DML操作过滤，按各种字段条件过滤，数据的转换处理等。
---

<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. 使用Maxwell Kafka做ETL同步Mysql</a>
<ul>
<li><a href="#sec-1-1">1.1. Maxwell介绍</a></li>
<li><a href="#sec-1-2">1.2. Kafka介绍</a></li>
<li><a href="#sec-1-3">1.3. Maxwell-Sink介绍</a>
<ul>
<li><a href="#sec-1-3-1">1.3.1. Maxwell-Sink提供的特性</a></li>
</ul>
</li>
<li><a href="#sec-1-4">1.4. mysql数据同步架构图</a></li>
<li><a href="#sec-1-5">1.5. mysql数据同步后结果校验  TODO</a></li>
<li><a href="#sec-1-6">1.6. 问题</a>
<ul>
<li><a href="#sec-1-6-1">1.6.1. 消息丢失</a></li>
<li><a href="#sec-1-6-2">1.6.2. 顺序性</a></li>
<li><a href="#sec-1-6-3">1.6.3. 重复性</a></li>
<li><a href="#sec-1-6-4">1.6.4. 高可用</a></li>
<li><a href="#sec-1-6-5">1.6.5. 低延时</a></li>
<li><a href="#sec-1-6-6">1.6.6. 数据类型强制转换，SQL拼装</a></li>
<li><a href="#sec-1-6-7">1.6.7. 非主流的DML操作</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>

# 使用Maxwell Kafka做ETL同步Mysql<a id="sec-1" name="sec-1"></a>


## Maxwell介绍<a id="sec-1-1" name="sec-1-1"></a>

maxwell使用和mysql slaver相同的方式，通过读取mysql的日志文件binlog获取数据的变更。  
然后将binlog event转换为JSON数据，使用kafka producer写入到Kafka的topics中。  
具体介绍见：[Maxwell's daemon](http://maxwells-daemon.io/) 。  

## Kafka介绍<a id="sec-1-2" name="sec-1-2"></a>

Kafka是Linkedin开发的一个分布式，多分区，多副本的的海量日志系统，也可以用作消息队列。  
在这里主要是做数据中转站，存储maxwell产生的json数据，然后提供给maxwell-sink消费，或者其他实时数据分析系统消费。  
具体介绍见：[Apache Kafka](https://kafka.apache.org/) 。  

## Maxwell-Sink介绍<a id="sec-1-3" name="sec-1-3"></a>

Maxwell-Sink是我基于[Kafka Connect](/Kafka-Connect-Details.html)写的一个支持mysql jdbc的Sinker。  
除了写入到mysql当然你也可以加个Adapter，将数据同步到其他数据仓库，比如HDFS，ES等。其实这整个就是一个ETL。  

Maxwell-Sink的功能是将Kafka中的JSON数据进行过滤，转换成SQL语句，然后使用JDBC，沉淀到指定的目标mysql实例中。  
Github项目地址见：[maxwell-sink](https://github.com/songxin1990/maxwell-sink) 。  

### Maxwell-Sink提供的特性<a id="sec-1-3-1" name="sec-1-3-1"></a>

1. 针对多个字段值进行过滤，比如终端号这个字段必须满足那些条件才能被放行。  
2. 对数据进行一些必要的处理，转换。  
3. 可以指定要同步过去的数据库名，表名，比如db_origin.t_term到db_back.t_terminal。
4. 可以适配到多个目的数据仓库，比如可以导出到HDFS，ES等。
5. 针对不同的DML操作进行过滤。

## mysql数据同步架构图<a id="sec-1-4" name="sec-1-4"></a>

![MySqlSync-Maxwell-Kafka-MaxwellSink](/img/life/mysqlSync-maxwell-kafka-maxwellsink.jpg) 

## mysql数据同步后结果校验<a id="sec-1-5" name="sec-1-5"></a>

**TODO 这个还真是个大问题。**  
首先说说难点：  
1. 整个数据同步过程是动态的，前后隔了几毫秒，可能就有数据改变  
2. 数据库里面的数据太大了，比较起来非常耗时，而且不能锁表，影响业务。  
3. 我们进行的数据同步不是全量的，而是部分的，也就是说必须将库表A中的部分数据和库表B的进行比较。  

目前我们也没找到好的方案，但是因为我们的“非主流”同步玩法，所以可以保证数据的最终一致性，  
并且所有数据都是单向同步，所以可以认为问题不大。（。。。弱弱的说）

## 问题<a id="sec-1-6" name="sec-1-6"></a>

### 消息丢失<a id="sec-1-6-1" name="sec-1-6-1"></a>

我们先看看那些环节会导致消息丢失。  
1. maxwell消息生产端  
因为binlog的对应的offset是保存在mysql中的，所以不存在这个问题。
2. kafka broker接收端  
这一点在我之前的文章中写的很清楚了，具体见：Apache Kafka技术分享。
3. maxwell-sink消息消费端  
主要关注consumer的offset提交， **不要消息未消费成功，offset却提交成功了，这样就会造成消息丢失。**  
我们宁可消息offset提交失败，消息重复性消费，也不要造成消息的丢失。  
元数据问题：maxwell-sink的offset是记录在配置的Kafka的Topic中（也就是日志文件），而kafka的多副本机制会保证元数据的有效可用。  

### 顺序性<a id="sec-1-6-2" name="sec-1-6-2"></a>

如何保证源数据库中进行的增删改操作，输出到kafka，然后进入到maxwell-sink消费后，依然保持顺序？  
因为maxwell是根据主键primary key进行hash取模的，因此可以保证同一个id的数据的增删改会输出  
到同一个partition。而我们知道同一个partition只能分配到一个Task consumer（也就是一个线程）因此能保证顺序性。  

### 重复性<a id="sec-1-6-3" name="sec-1-6-3"></a>

因为我们的线上kafka集群不是用的0.11.x的，所以没有exactly once特性，因此消息的重复无法避免。  
但现在的业务场景是：我们并不一定要满足实时的强一致性要求，只需要最终一致性就可以了。  

对于重复insert，使用的是INSERT &#x2026; ON DUPLICATE KEY UPDATE &#x2026;。  
具体的请看这篇文章：[How to INSERT If Row Does Not Exist (UPSERT) in MySQL](https://chartio.com/resources/tutorials/how-to-insert-if-row-does-not-exist-upsert-in-mysql/) 。

对于重复的update，因为能够保证顺序性，因此后面执行的update总会在后面执行，也能满足最终一致性。  

对于重复的delete，where条件是用的primary key，后续的delete有任何影响。    

### 高可用<a id="sec-1-6-4" name="sec-1-6-4"></a>

Maxwell：  
问题较大，因为是单实例的，存在单点故障，而且貌似输出DDL很容易造成解析DDL语句出错，然后就启动不了。  
但是好像maxwell做成集群方式，内部通信也不太可能，太复杂。现在maxwell是将Source offset保存在数据库中的，  
因此挂掉后，重新读数据库，从上一次消费的地点重新开始就好。  

Kafka：  
目前kafka使用的5个Broker，每个topic是3个副本，5个分区，因此3个副本都完全不可用的情况很小。（至少要3个Broker都挂掉。）  

Maxwell-Sink：  
借助于Kafka Connect，maxwell-sink也可以做到分布式，多实例的协同工作，如果一个实例挂了，会在Task层面自动进行负载均衡。  

### 低延时<a id="sec-1-6-5" name="sec-1-6-5"></a>

借助于kafka的特性，延时非常的低，而且同步的速度非常的快，具体有兴趣的可以自己测试下。  

### 数据类型强制转换，SQL拼装<a id="sec-1-6-6" name="sec-1-6-6"></a>

目前拼装SQL的方式比较粗糙，直接取出数据，如果是null返回null，不是null的对值加单引号，结果是类似这种。  
\`sn\` = '518000' and \`update_time\` = null;  
之前的代码里面直接用的：  
String strVal = (String) map.get(sn);//这种对有值的Integer，Long等无法直接转，  
后面改成：  
String strVal = String.valueOf(map.get(sn));//这种null的会转成"null"字符串。  
看来还是基础掌握的不好啊。  

### 非主流的DML操作<a id="sec-1-6-7" name="sec-1-6-7"></a>

这个项目里面了，有2个非主流的DML操作。  
一个是Insert If Not Exist Update  
这个操作还好，为了防止kafka重复性消费造成的重复性insert，只做个update，将数据更新为最新的。  

一个是Update If Not Exist Insert。  
这个。。。就是进行更新，如果不存在，就插入。  
这个东西最后的语义也转成上面一条了，效果是一样的  。

## 相关推荐文章
[Apache Kafka技术分享](/bigdata/Kafka-Share.html)  
[Kafka消息投递语义-消息不丢失，不重复，不丢不重](/bigdata/Kafka-Message-Delivery-Semantics.html)  
[Kafka Connect教程详解](/bigdata/Kafka-Connect-Details.html)
[Kafka Connect开发教程](/bigdata/Kafka-Connect-Develope-Details.html)