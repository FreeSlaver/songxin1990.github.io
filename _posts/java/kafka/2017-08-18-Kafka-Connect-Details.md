---
layout: page

title: Kafka Connect教程详解
redirect_from:
  - /2017/08/18/Kafka-Connect-Details.html
category: kafka
categoryStr: 大数据
tags: kafka
keywords: [kafka connect,kafka,教程]
description: Kafka Connect技术详解，包含介绍，启动和配置，单机，分布式模式，转换器，如何开发kafka connect，以及相较于producer和consumer的优势。
---

<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li>
<ul>
<li><a href="#sec-1-1">1.1. 介绍</a></li>
<li><a href="#sec-1-2">1.2. 启动和配置</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. Standalone 单机模式</a></li>
<li><a href="#sec-1-2-2">1.2.2. Distribute 分布式模式</a></li>
<li><a href="#sec-1-2-3">1.2.3. Connector的配置</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. Transformations 转换器</a></li>
<li><a href="#sec-1-4">1.4. REST API</a></li>
<li><a href="#sec-1-5">1.5. Kafka Connect 开发详解</a></li>
<li><a href="#sec-1-6">1.6. Kafka Connect VS Producer Consumer</a>
<ul>
<li><a href="#sec-1-6-1">1.6.1. Kafka Connect的优点</a></li>
</ul>
</li>
<li><a href="#sec-1-7">1.7. 第三方资源</a></li>
<li><a href="#sec-1-8">1.8. 参考</a></li>
</ul>
</li>
</ul>
</div>
</div>



## 介绍<a id="sec-1-1" name="sec-1-1"></a>

Kafka Connect是在0.9以后加入的功能，主要是用来将其他系统的数据导入到Kafka,然后再将Kafka中的数据导出到另外的系统。  
可以用来做实时数据同步的ETL，数据实时分析处理等。  

主要有2种模式：Standalone（单机模式）和Distribute（分布式模式）。  
单机主要用来开发，测试，分布式的用于生产环境。  

## 启动和配置<a id="sec-1-2" name="sec-1-2"></a>

### Standalone 单机模式<a id="sec-1-2-1" name="sec-1-2-1"></a>

启动命令：  
bin/connect-standalone.sh config/connect-standalone.properties connector1.properties \[connector2.properties ...]    
这个配置有点多，官方的文档也没说太清楚。什么东西搞多了，都容易出错，相互间关系也复杂了。  
下面我解释下：    
执行单机启动脚本connect-standalone.sh，将connect-standalone.properties属性文件传递进去作为Worker的配置，  
另外的配置就是属于Connector的配置，会被全部传递给SourceConnector和SinkConnector。  

bootstrap.servers：  
kafka集群地址，例如：10.33.2.1:9092,10.33.2.9:9092,10.33.1.13:9092  

key.converter：  
用来转换写入或者读出kafka中消息的key的，例如：org.apache.kafka.connect.json.JsonConverter。  
效果是对指定了key是id=1000，转换成{"id" : 1000}，也可以使用Avro的格式。我做的项目使用的maxwell，   
发现使用Json转换后，字段的双引号全没了，冒号变成等号，变成了这种鬼东西{id=1000}。  
后面直接改成使用String的转换器，然后自己做JSON转换：org.apache.kafka.connect.storage.StringConverter。    

value.converter：  
同上，只是用来转换消息的value的，也就是传输的具体数据。  

offset.storage.file.filename：  
默认是：/tmp/connect.offsets。    
**这个配置要注意下，单机模式是需要自己持久化offset的。** Kafka Connect会用这里配置的文件保存offset。  
而且针对producer和consumer（也就是source和sink）需要单独分别配置：  
producer.offset.storage.file.filename=/temp/source-offset  
consumer.offset.storage.file.filename=/temp/sink-offset  
但是，我单机好像从来没成功过，每次重启，offset都被reset了，都是重头消费。  

### Distribute 分布式模式<a id="sec-1-2-2" name="sec-1-2-2"></a>

启动命令：  
bin/connect-distributed.sh config/connect-distributed.properties  

分布式模式下，connector的配置都是通过Rest API接口提交给kafka的。  
但配置中不需要配置保存offset的文件，因为分布式下，都是将offsets，configs和status保存到相应的topics中的。  
然后由Worker决定如何存储配置，分配工作，存储offsets和task的状态信息。  
**切记，为了程序的高可用，这3个topics最好手动创建。**    
具体命令，请看另外一篇博客：[Kafka命令](/bigdata/Kafka-Command.html) 。

group.id：  
也就是connect-cluster的group id，这个不能和consumer的goup id冲突。  

config.storage.topic：  
用来保存connector和task的配置的。 **单分片，多副本，压实类型（compacted）** 的topic。  
**因为非压实的topic在一定配置，触发条件下，会删除！！！**  
这里的多副本是为了配置一直都可用，建议数量等于Kafka Brokers的数量。单分片，应该是刚开始启动，初始化的时候，  只有一个线程消费。  

offset.storage.topic：  
用来保存offset的，既有source connect的，也有sink connect的offset。多分片，多副本，压实的topic。  

status.storage.topic：  
用来存储task状态的，多分片，多副本，压实的topic。  
这两个多分片，多副本配置和一般的topic相同就行了，比如我们是3个副本，5个partition。  

上面的3个topic，你都可以用console-consumer进行消费看看，特别是status.storage.topic，会非常有用，  
**因为分布式模式下，task因为一些配置，异常关掉，只会显示xxxTask closed，但是不会显示异常信息。**  
而从status.storage.topic中消费出来的消息可以看到具体异常信息。  

### Connector的配置<a id="sec-1-2-3" name="sec-1-2-3"></a>

name：  
connector的唯一名字  
  
connector.class：  
用来连接Kafka集群的类名，也就是你继承SourceConnector或SinkConnector的实现类，  
也就是Connector程序的入口，尽量使用全量路径名。 
   
tasks.max：  
task的数量，一个task就是一个线程。task数量设置要小于等于分片partition的数量，多了并发度无法提高。  
  
key.converter：  
覆盖掉传递给Worker的消息的key转换类，也就是connect-stadalone.properties  
和connect-distirbute.properties中key.converter。  
   
value.converter：同上。 
     
topics：  
要消费的topic列表，对于sink connector才需要配置。  
  
## Transformations 转换器<a id="sec-1-3" name="sec-1-3"></a>

用来将消息进行修改，转换，以及路由的。可以将多个组合起来，作为一个转换链。  
个人建议是，这些代码直接在connector中写，除非可以部署上去，多个系统公用。  
还有一方面是，黑盒的类太多，出问题了后不知道是哪里出问题了，而且也不能本地debug。  
再就是Transformations的配置也太多了，学习成本有点高。这块的详细内容没看，详情请看官网。  

## REST API<a id="sec-1-4" name="sec-1-4"></a>

这块就是用来查询Connector和Task的状态，主要用于Connector集群的监控。  
GET /connectors - 查询所有connectors  
POST /connectors - 提交一个connector。比如是JSON格式，例子：  
```
{
 "name": "maxwell-sink",
 "config": {
   "name" : "maxwell-sink",
   "connector.class" : "com.cimc.maxwell.sink.MySqlSinkConnector",
   "tasks.max": 1,
   "topics": "estation.db_ez.t_parcel,estation.db_ez.t_box",
   }
 }
 ```
GET /connectors/{name} - 查询指定connector信息的  
GET /connectors/{name}/config - 查询指定connector配置的  
PUT /connectors/{name}/config - 更新指定connector配置的  
这里要说下这个PUT更新配置，需要全量传入更新后的配置，body直接传入类似这种：  
```
{
   "name" : "maxwell-sink",
   "connector.class" : "com.cimc.maxwell.sink.MySqlSinkConnector",
   "tasks.max": 10,
   "topics": "estation.db_ez.t_parcel,estation.db_ez.t_box,estation.db_ez.t_book_parcel",
}
```
GET /connectors/{name}/status - 查询指定connector状态的  
GET /connectors/{name}/tasks - 查询指定connector的所有tasks  
GET /connectors/{name}/tasks/{taskid}/status - 查询指定connector的指定task的状态的，taskid一般是0，1，2之类  
PUT /connectors/{name}/pause - 暂停指定connector的，慎用，比如因为系统更新升级，想停掉source connector拉取消息  
PUT /connectors/{name}/resume - 恢复上面暂停的connector的  
POST /connectors/{name}/restart - 重启一个connector（connector因为一些原因挂掉了，比如被强行杀死，一般不是异常造成）  
POST /connectors/{name}/tasks/{taskId}/restart - 重启一个指定的task的  
DELETE /connectors/{name} - 删除一个connector  
GET /connector-plugins - 获取所有已安装的connector插件  
PUT /connector-plugins/{connector-type}/config/validate - 校验connector的配置的属性类型。    
#### 优雅关闭
Kafka Connect是不提供关闭Connector的REST API，可以直接kill -9或者先delete掉，再post生成（需要保持name一致）

## Kafka Connect 开发详解<a id="sec-1-5" name="sec-1-5"></a>

详见我的另外一篇博客：[Kafka Connect 开发详解](/bigdata/Kafka-Connect-Develop-Details.html) 。

## Kafka Connect VS Producer Consumer<a id="sec-1-6" name="sec-1-6"></a>

其实Kafka Connect的本质就是将Kafka Client包装了一层，并对开发者提供统一的实现接口。   
Source Connector对应Producer，Sink Connector对应Consumer。  

### Kafka Connect的优点<a id="sec-1-6-1" name="sec-1-6-1"></a>

1.对开发者提供了统一的实现接口  
2.开发，部署和管理都非常方便，统一   
3.使用分布式模式进行水平扩展，毫无压力  
4.在分布式模式下可以通过Rest Api提交和管理Connectors  
5.对offset自动管理，只需要很简单的配置，而不像Consumer中需要开发者处理  
6.流式/批式处理的支持   

## 第三方资源<a id="sec-1-7" name="sec-1-7"></a>

这是已经得到支持的第三方组件，不需要做额外的开发：  
[Kafka Connect Product](https://www.confluent.io/product/connectors/)   
括号中的Source表示将数据从其他系统导入Kafka，Sink表示将数据从Kafka导出到其他系统。  
其他的我没看，但是JDBC的实现比较的坑爹，是通过primary key（如id）和时间戳（如updateTime）字段，  
来判断数据是否更新，这样的话应用范围非常受局限。  

## 相关推荐文章
[Apache Kafka技术分享](/bigdata/Kafka-Share.html)  
[使用Maxwell Kafka和Maxwell-Sink进行MySql数据同步](/bigdata/MySql-ETL-Using-Maxwell-Kafka-MaxwellSink.html)   
[Kafka消息投递语义-消息不丢失，不重复，不丢不重](/bigdata/Kafka-Message-Delivery-Semantics.html)  

## 参考<a id="sec-1-8" name="sec-1-8"></a>

[Kafka Documentation](https://kafka.apache.org/documentation/#connect)
