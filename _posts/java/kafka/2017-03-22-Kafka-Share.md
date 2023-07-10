---
layout: page

title: Apache Kafka技术分享
category: kafka
categoryStr: 大数据
tags: [essence kafka]
keywords: [essence kafka]
description: 这篇文章是我在在公司做的技术分享，包括了：Kafka是什么，Kafka的特性及优势，Kafka应用领域，Kafka配置，Kafka核心概念，Kafka架构，Kafka集群监控等等各个方面。
---


### Kafka是什么
Kafka是由LinkedIn公司用Scala语言开发的，一个分布式、分区的、多副本的、多订阅者的，基于Zookeeper协调的分布式日志系统(也可做MQ系统)。  
主要初衷目标是构建一个用来处理海量日志，用户行为和网站运营统计等的数据流处理框架。  

### Kafka的特性及优势
![kafka_features](/img/java/kafka_features.png)  
1. 高吞吐率，kafka的高吞吐率是秒杀其他消息系统的，原因在批处理，压缩，多分区等。
2. 高性能，MQ系统的性能瓶颈主要在于持久化和对消息消费的ack。  
kafka的持久化策略采用文件系统以及page cache，消息直接从内核到page cache，顺序写磁盘。消费的ack只需更新offset。
3. 多重订阅，不同的groupId组成不同的CG，形成多个订阅者，并且消费速率互不影响。
4. 消息持久性，kafka使用文件日志系统做存储，可以保留指定时间。
5. 良好伸缩性，broker节点和partition个数能在线增加，但是broker在线添加后，无法将之前topic的partition分配到新broker上面。
6. 高可用，N个副本，允许N-1个副本失效，服务依然可用。
7. 其他，kafka还有一些其他的特性，比如消息可回溯，顺序性消费，消息分区自定义，消息语义实现自定义等。

### Kafka vs ActiveMQ
如果对比的话，只能在Kafka作为MQ方面和ActiveMQ对比。  
1. kafka producer无法保证消息不重复，并且消费端并没有实现exactly once；activemq有单条消息的ack机制，能保证exactly once。  
2. kafka消息byte结构，批处理,走page cache;activemq消息java序列化对象，单条处理，走JVM内存。  
3. kafka并没有实现JMS规范，除了MQ还有很多其他功能；activemq是JMS的规范实现。  
4. kafka的一些高可用，高吞吐率远超activemq，因为kafka是多topic，多分区，多副本的。相互之间影响很小，而activemq一个节点挂了，发送到上面的消息需要重启才能消费。  
![kafka_vs](/img/java/kafka_vs.png)  

### Kafka应用领域
1. 日志聚合，收集各个平台的日志
2. 实时事件处理，如用户活动跟踪
3. 消息队列，系统解耦、消息缓存
4. 流式处理，结合Spark，Storm等

###	Kafka业界用例
- LinkedIn使用Kafka处理活动流数据和运营指标数据，支撑着除Hadoop离线分析系统外的多个系统，如LinkedIn news feed和LinkedIn Today。
- DataSift使用Kafka收集监控事件和实时跟踪用户消费数据。
- Twitter、1号店将Kafka作为Storm的一部分。
- Foursquare使用Kafka支撑在线和离线消息处理，将监控和基于Hadoop的离线的生产系统相集成。
- Square将Kafka当作总线使用，在各种各样的数据中心之间传递系统事件。
- eBay将Kafka作为数据传输平台，支持实时计算，做欺诈检测，用户个性推荐等，并且还可以将在线数据传输到离线系统。

### Kafka核心概念
- **Broker** : 一个kafka实例就是一个broker，多个broker组成集群。  
- **Topic** ： 消息主题，一类消息的总和。  
- **Producer** : 消息生产者。push批量消息到Leader Partition。  
- **Consumer** : 消息消费者。从Leader Partition pull消息，0.9之前Consumer的元数据信息保存在Zookeeper上；0.9以后在_consumer_offset上。  
- **Consumer Group(CG)** : 多个Consumer共用一个groupid组成一个CG，类似MQ中的一个Topic的订阅者。
一个CG可以消费一个或多个Topic。CG中Consumer个数大于Topic的partition个数，会出现空闲的Consumer。  
当一个Consumer加入或者离开CG，会触发Consumer的负载均衡。  
- **Partition** : 分片，一个Topic在物理上被顺序分配成多个Partition。一个Partition只能被CG中的一个Consumer消费。  
- **Replica** : 副本，是Partition的数据副本，一个Partition可以有多个副本，副本中负责读写请求的叫Leader Partition。  
- **Metadata** : 元数据信息，包含一条消息所在的topic，partition，offset等信息。  
- **Offset** : 消息偏移量，用于标识Partition中唯一一条消息。  
- **ISR** : in sync replica,同步副本列表，判断标准是：1.可以从leader partition中拉取数据；2.消息没有落后太多。  
- **Segment** : 段，由成对的.index和.log文件组成，多个Segment组成一个Partition。 
 
![kafka_consumer_group](/img/java/kafka_consumer_group.png)  

**下图是一个我们线上的estation-parcel的topic描述结果**

bin/kafka-topics.sh --describe --zookeeper 10.33.2.228:2181,10.33.2.91:2181,10.33.2.63:2181 --topic estation-parcel

![kafka_topic_describe](/img/java/kafka_topic_desc.png)   

![kafka_failover](/img/java/kafka_failover.png)  

### Kafka配置
kafka的配置非常的多，Broker，Producer,Consumer每一个都不止3屏。下面是一份我们生产Broker用的配置：  
```
broker.id=0
delete.topic.enable=true
listeners=PLAINTEXT://ip:9090
num.network.threads=3
num.io.threads=8
socket.send.buffer.bytes=102400
socket.receive.buffer.bytes=102400
socket.request.max.bytes=104857600
log.dirs=/data/kafka/kafka-ez-logs
num.partitions=3
unclean.leader.election.enable=false
min.insync.replicas=2
num.replica.fetchers=2
num.recovery.threads.per.data.dir=1
log.flush.interval.messages=10000
log.flush.interval.ms=1000
log.retention.hours=72
log.retention.bytes=1073741824
log.segment.bytes=1073741824
log.retention.check.interval.ms=300000
auto.leader.rebalance.enable=true
auto.create.topics.enable=false
zookeeper.connect=ip1:2181,ip2:2181,ip3:2181/kafka/ez
zookeeper.connection.timeout.ms=100000

```
1. 如果有机器故障，比如磁盘坏掉或者速度很慢，可以直接将新机器上kafka实例的broker.id设置和此故障机器的一样，这样就能拉取同步此broker的数据。
2. unclean.leader.election.enable=false（default true）当partition的ISR全部挂掉，是否允许第一个起来的replica成为leader。  
如果不设置为false就有可能丢数据，但是当所有ISR都挂掉的时候，会导致此Partition服务不可用。 
3. min.insync.replicas=2当acks=all，ISR列表中至少2个确认写操作成功，才认为成功，这会防止当ISR中唯一的1个确认写操作成功，但又立马挂掉时的消息丢失。  

Producer配置  
```
bootstrap.servers=node2:9092,node2:19092,node2:29092
acks=all
retries=3
batch.size=16384
linger.ms=1
buffer.memory=33554432
```
Consumer配置
```
bootstrap.servers=node2:9092,node2:19092,node2:29092
enable.auto.commit=false
#auto.commit.interval.ms=1000
session.timeout.ms=30000
#[latest, earliest, none]
auto.offset.reset=latest
max.poll.records=200
```
1. enable.auto.commit=true会间隔auto.commit.interval.ms时间，自动commit offset到zookeeper（0.9以前）或者kafka。   
enable.auto.commit=false需要手动提交offset，我们采取的这种方式，避免消息处理之前，自动的提交offset造成的消息丢失。  
2. auto.offset.reset=latest当CG重启后无法从zookeeper或者kafka中获取到自己的offset信息，会根据此属性重置offset。  
earliest：就是此partition保存的最老的offset信息。latest：可以认为就是CG启动后，开始消费刚写入的消息。none:会抛异常。  

### Kafka和Zookeeper关系
![kafka_zookeeper](/img/java/kafka_zookeeper.png)  
1. 主要记录broker，topic，controller等的注册信息和数据描述结构。  
2. Topic的描述信息，存在哪些topic，有哪些partition，replica以及leader partition在那个broker上。  
3. 0.9以前，保存了consumer的一些元数据信息，哪些consumer消费到那个topic的那个partition的offset了。  
4. controller的选举，partition leader选举，consumer的负载均衡。  
5. broker状态和ISR列表信息。  

### Kafka架构
![kafka_architecture](/img/java/kafka_architecture.jpg)  

**kafka消息流**
![kakfka_message_stream](/img/java/kakfka_message_stream.png)  

### Kafka消息投递语义
1. At most once-消息可能会丢失但至多被消费一次，不会被重复消费  
kafka producer端：目前不支持这个特性，以后上会加上类似主键这种机制，当响应也返回相同的主键时，认为消息投递成功，完成一次幂等操作。  
kafka consumer端：如果CG先提交offset并成功，但是处理消息时失败，这样消息就可能丢失，造成at most once。  

2. At least once—消息不会丢失且至少被消费一次，可能会被重复消费  
kafka consumer端:如果消息处理成功，但是提交offset失败，这时partition被分配到其他consumer，就会从上一次提交的offset消费，但实际上这些消息已处理，就会造成at least once。  

3. Exactly once—消息不会丢失，并且只被消费一次。  
想获得exaclty once就要解决CG的consumer之间的协调问题，也就是接管partition的consumer从上一次正确的offset开始消费。  
KafkaConsumer源码中有个简单的方法就是将offset保存到db中，并和业务处理绑定为一个事务，业务处理成功，offset也保存成功。  
如果consumer挂掉，下次消费就取db中的offset去拉取消息。如果业务处理失败，offset也保存失败，consumer挂掉，还会继续从上一个提交成功的offset开始消费。  

### Kafka Failover 故障恢复
#### Zookeeper挂了  
zookeeper挂了的话，kafka集群服务完全不可用。无论Producer还是Consumer。  
#### Broker挂了  
**挂掉的broker恰好是Controller**  
那么剩下的broker会去zookeeper的/Controller目录下抢占注册自己的broker.id。如果其他broker注册成功，剩余broker更新元数据信息。如果当前broker注册成功，就会进行初始化工作。    
**Controller的作用**主要是创建和维护partition和replicas的状态信息，并进行partition leader的选举，以及监控broker和partition的变化。  

broker挂掉后就会进行此节点上的leader partition选举，由Controller从此partition的ISR列表中随机选出一个作为新的leader提供读写服务。     
如果ISR列表为空，并且unclean.leader.election.enable=false，那么此partition的服务就不可用。unclean.leader.election.enable=true,就会从replica中选取一个做为新的leader,这时就会发送消息丢失。  
并且当leader partition复活后，发现自己不是leader，并且offset比当前的leader多，就会发生日志截取，然后同步到当前的leader。此节点上的非leader partition只是会减少一份数据，在ISR列表中的会被移除。      
##### 对Producer的影响  
acks=0无影响，但发送出去的消息已经丢失；  
acks=1，并且ISR中唯一的partition leader接收到消息并确认后，又挂掉了，这时要看unclean.leader.election.enable的配置，
如果是false，那么此partition的服务就不可用；如果是true，那么就会将最新可用的partiton replica选举为partition leader（无论是否在ISR），这时就会丢失消息。    
并且当leader partition复活后，发现自己的offset超出了当前的leader，就会发生：  
```
[2017-02-26 08:55:49,359] INFO Truncating log estation-parcel-24 to offset 48123. (kafka.log.Log)
```
acks=all，ISR中也只有唯一的partition leader，也会发生上述情况。  
设置了min.insync.replicas=2，那么就是最少2个ISR中的repical确认才算消息写操作成功，会移动water mark。如果ISR不足会抛异常。  
kafka消息不丢失的语义前提是partition的ISR永远至少有一个。  

##### 对Consumer的影响  
消费者消费完消息后的offset commit和生产者写消息的commit都是要得到ISR中的replica确认的。所以，只有当ISR中所有replica确认收到消息后，才会将commited offset后移，这条消息才会对consumer可见。  
![kafka_failover_consumer](/img/java/kafka_failover_consumer.png)  

#### Producer发送
1. dataserver发送包裹变跟到ESB_Producer，会被放到Kafka的estation-parcel这个Topic中。  
```
Listenablestock<SendResult<String, String>> stock = kafkaTemplate.send(key,topic, vo.toString());
SendResult<String, String> result = stock.get(10, TimeUnit.SECONDS);
```
2. send操作只是刷到buffer中，等满足buffer.memory=33554432或者过了linger.ms=1后，才会网络发送出去，这是为了提高吞吐率。我们这里使用的是一个同步阻塞等待的过程。  

Producer端比较简单，就是将消息往topic的partition中塞入，一般不会出什么问题。  
#### Kafka对消息的存放
1. producer发送消息时，可以指定消息的key，相同的key会被hash到同一个partition，用户也可以自定义实现消息应该按照何种策略投放到那个partition上。  
2. 当leader partition接收到消息后就会通知其他的replicas来拉取消息。等ISR中的replicas全部确认，才会移动commited offset，这时才会对消费者可见。（故障）  

#### Consumer消费
```
ConsumerRecords<String, String> records = consumer.poll(5000);
//Loop,Do Business
consumer.commitSync();
```
1. consumer会去pull数据，当topic无数据的时候，会poll（times）阻塞等待times毫秒。有数据，会在request中携带offset信息拉取数据。  
2. 消费完成之后，会进行commit offset。（故障）  
（这里有个问题就是如果业务处理异常了，offset如何处理？我们是直接try catch掉，然后塞DB进行重试。）  

### Kafka监控

#### 控制管理台
常见的Kafka开源监控工具有:  
1. Kafka Web Console  
3年前就已经停止维护，并且有BUG，工具在成功读取集群分区日志长度后，连接不释放，会产生大量的socket连接，导致网络堵塞。  
2. Kafka Offset Monitor  
部署方便，但是对集群的监控，管理能力较弱。  
3. Kafka Manager  
我们目前正在使用的，Yahoo出品，但是也有bug。之前遇到的一个就是集群环境连接不上，会疯狂刷日志到application.log中，日志大小达到37G。  
控制台进行的topic删除也会触发一个bug，所以尽量在kafka-server.sh等中操作。  
![kafka_manager](/img/java/kafka_manager.png)
http://139.199.204.237:9000/clusters/ez_esb/brokers


#### 基础监控
对于Kafka的监控，我们运维团队做了相应的实时监控告警平台。  
1. 对kafka应用的一些基础监控，如cpu，内存，磁盘，进程存活等的监控  
2. 对Kafka的异常日志，可用端口，心跳，zk连接，ISR列表，可用brokers个数等都进行了监控。 

当触发之后，会给应用相关的负责人发送短信，微信，邮件等告警，并携带相关信息。  

### 实践中的坑
1. partition数量设置过多  
一个partition只能被CG中的一个consumer消费，因此，为了提高并发量，可以提高partition的数量，但是这会造成replica副本拷贝的网络请求增加，故障恢复时的耗时增加。  
因为kafka使用batch pull的方式，所以单个线程的消费速率还是有保障的。并且partition数量过多，zk维护ISR列表负载较重。  

2. kafka重启顺序  
之前我们使用3个broker作为集群，broker_0,broker_1,broker_2，当broker_1无法响应broker_0和broker_2的同步请求时，broker_0和broker_2会报错：  
**Connection to 1 was discoonectes before the response was read.**  
同时broker_1上面也会报错，这时的操作应该先重启broker_1，并且等待日志刷出startup completely再去重启另外的机器。  
而不能先重启broker_2或broker_0，这会导致部分服务不可用，并且，而且重启后有可能会丢失消息。  

3. kafka的版本选择  
之前选了一个0.10.0的版本，是当时最新的官方release版本，但是有一个死锁bug，导致当前broker对另外broker上的replica的同步数据请求不响应。  
https://issues.apache.org/jira/browse/KAFKA-4477 
所以选择版本的时候要看下此版本还有些什么bug，相对于上个大版本修复了些什么bug，看是否对自己的业务有影响。  

### 遇到Kafka问题怎么办
0. 首先看server_err.log，serever.log,controller.log等日志信息定位问题。  
1. [Kafka官网Doc](https://kafka.apache.org/documentation)   
2. [Kafka wiki](https://cwiki.apache.org/confluence/display/KAFKA/Index)  
3. [Kafka issues](https://issues.apache.org/jira/browse/KAFKA)  
4. Google+Github+Stackoverflow  

### 相关资料和扩展阅读
[Kafka Connect详解](/bigdata/Kafka-Connect-Details.html)  
[Kafka Connect开发详解](/bigdata/Kafka-Connect-Develop-Details.html)  
[Kafka消息投递语义-消息不丢失，不重复，不丢不重](/bigdata/Kafka-Message-Delivery-Semantics.html)  

