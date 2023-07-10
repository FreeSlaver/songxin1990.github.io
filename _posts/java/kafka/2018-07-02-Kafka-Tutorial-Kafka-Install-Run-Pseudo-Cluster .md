---
layout: page

title: Kafka教程1:Kafka安装运行与伪集群环境搭建
category: kafka
categoryStr: Kafka
tags: kafka
keywords: kafka教程,kafka安装,kafka
description: Kafka教程1:Kafka安装运行与伪集群环境搭建，如何在Centos和Windows上搭建Kafka运行环境和伪集群搭建，及Windows环境问题解决。
---

<div id="table-of-contents">
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1-1">1.1. 1. 下载安装</a></li>
<li><a href="#sec-1-2">1.2. 2. 启动Zookeeper</a></li>
<li><a href="#sec-1-3">1.3. 3. 启动Kafka</a></li>
<li><a href="#sec-1-4">1.4. 4. 创建消息主题Topic</a></li>
<li><a href="#sec-1-5">1.5. 5. 启动消费者监听并消费消息</a></li>
<li><a href="#sec-1-6">1.6. 6. 使用生产者产生消息</a></li>
<li><a href="#sec-1-7">1.7. 单机伪集群搭建</a></li>
<li><a href="#sec-1-8">1.8. Windows上的搭建和问题</a></li>
</ul>
</div>
</div>


本文以Centos 6.8和Windows 7为运行环境，以Centos为主，Windows为辅，不过出现的问题都会标注出来。  

### 1. 下载安装<a id="sec-1-1" name="sec-1-1"></a>
```bash
wget https://www.apache.org/dyn/closer.cgi?path=/kafka/1.1.0/kafka_2.11-1.1.0.tgz
tar -xzf kafka_2.11-1.1.0.tgz
cd kafka_2.11-1.1.0
```
### 2. 启动Zookeeper<a id="sec-1-2" name="sec-1-2"></a>

可以使用kafka下载包里面自带的zookeeper或者之前已经安装的zookeeper。  
./bin/zookeeper-server-start.sh config/zookeeper.properties

### 3. 启动Kafka<a id="sec-1-3" name="sec-1-3"></a>

./bin/kafka-server-start.sh config/server.properties

### 4. 创建消息主题Topic<a id="sec-1-4" name="sec-1-4"></a>

./bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 1 --partitions 1 --topic test  
解释下：创建一个名称为test的主题Topic，副本因子为1，分片数量为1。  
replication-factor就是副本因子，如果--replication-factor为3的话，就是有3份数据完全相同的副本。  
partitions就是分片数量，也就是将一个Topic的完整数据集，切分成几片数据集。--partitions 3就是切分成3片，  
类似将一块蛋糕切成了3份。  
列出所有主题:  
./bin/kafka-topics.sh --list --zookeeper localhost:2181

### 5. 启动消费者监听并消费消息<a id="sec-1-5" name="sec-1-5"></a>

./bin/kafka-console-consumer.sh --bootstrap-server localhost:9092 --topic test --from-beginning

### 6. 使用生产者产生消息<a id="sec-1-6" name="sec-1-6"></a>

重新打开一个控制台，生产消息  
./bin/kafka-console-producer.sh --broker-list localhost:9092 --topic test

This is a message  
This is another message  

切换到之前的消费者控制台，可以看到：  
This is a message  
This is another message  

### 单机伪集群搭建<a id="sec-1-7" name="sec-1-7"></a>

伪集群的搭建和集群是一样的，只是在同一台机器启动多个Kafka Broker实例，将Kafka监听的端口换掉，broker id换掉就行。  
cp config/server.properties config/server-1.properties  
cp config/server.properties config/server-2.properties  

修改文件中以下3个参数：  
```bash
broker.id=1
listeners=PLAINTEXT://:9093
log.dir=/tmp/kafka-logs-1
```

启动另外2个Broker实例：  
./bin/kafka-server-start.sh config/server-1.properties &  
./bin/kafka-server-start.sh config/server-2.properties &  

新建一个名为my-replicated-topic，副本数为3，分片为1的主题:  
./bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 3 --partitions 1 --topic my-replicated-topic

展示Topic详细信息：  
./bin/kafka-topics.sh --describe --zookeeper localhost:2181 --topic my-replicated-topic
得到如下输出：  
Topic:my-replicated-topic   PartitionCount:1    ReplicationFactor:3 Configs:  
  Topic: my-replicated-topic  Partition: 0    Leader: 1   Replicas: 1,2,0 Isr: 1,2,0  

大概解释下：  
第一行，Topic名为my-replicated-topic的分片数量为1，副本数量（副本因子）为3，  
第二行，partition leader在broker.id=1的kafka broker实例上，副本分布到broker.id为1,2,0的3个broker实例上，  
isr列表是：1,2,0，ISR的缩写是in sync replicas，翻译过来就是同步副本列表，表明此partition在broker.id为1,2,0的3个实例上的副本都是存活，并且数据同步的。  
数据同步可能有点不太准确（这里有个判断标准和机制，以后再讲。）  
当leader partition挂掉之后，就会从ISR中选举一个partition follower作为新的leader。  

可以杀掉broker.id为1的实例，然后看看会发生什么  
ps aux | grep server-1.properties  
kill -9 7564  

./bin/kafka-topics.sh --describe --zookeeper localhost:2181 --topic my-replicated-topic

### Windows上的搭建和问题<a id="sec-1-8" name="sec-1-8"></a>

在Windows上的过程是一样的，只是命令行工具放在了bin/windows目录下。  
kafka windows启动时，可能会报一个错误：找不到或无法加载主类 files\java\jdk1.8.0_91\lib;c:\program  
只需要将kafka-run-class.bat文件中的142的%CLASSPATH%加上双引号就行了。  
应该是CLASSPATH的值包含了空格，导致出错。  
修改前：  
set COMMAND=%JAVA% %KAFKA_HEAP_OPTS% %KAFKA_JVM_PERFORMANCE_OPTS% %KAFKA_JMX_OPTS% %KAFKA_LOG4J_OPTS% -cp %CLASSPATH% %KAFKA_OPTS% %*  
修改后：  
set COMMAND=%JAVA% %KAFKA_HEAP_OPTS% %KAFKA_JVM_PERFORMANCE_OPTS% %KAFKA_JMX_OPTS% %KAFKA_LOG4J_OPTS% -cp **"%CLASSPATH%"** %KAFKA_OPTS% %*  

### 相关阅读