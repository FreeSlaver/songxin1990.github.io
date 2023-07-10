---
layout: page

title: Kafka Connect部署教程
category: kafka
categoryStr: 大数据
tags: kafka
keywords: [kafka connect,kafka,部署,教程]
description: Kafka Connect部署详解，包括添加依赖，部署，打包，配置文件，启动等。
---

<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Kafka Connect部署教程</a>
<ul>
<li><a href="#sec-1-1">1.1. 编译，部署</a>
<ul>
<li><a href="#sec-1-1-1">1.1.1. 编译，上传jar包</a></li>
<li><a href="#sec-1-1-2">1.1.2. 新建connect配置文件</a></li>
<li><a href="#sec-1-1-3">1.1.3. 配置plugin.path</a></li>
<li><a href="#sec-1-1-4">1.1.4. 启动</a></li>
<li><a href="#sec-1-1-5">1.1.5. 监控</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>



阅读本文前，可以先看看关于Kafka Connect概念和开发的2篇文章：  
[Kafka Connect教程详解](/bigdata/Kafka-Connect-Details.html)  
[Kafka Connect开发教程](/bigdata/Kafka-Connect-Develop-Details.html)

## 编译，部署<a id="sec-1-1" name="sec-1-1"></a>

### 编译，上传jar包<a id="sec-1-1-1" name="sec-1-1-1"></a>

新建一个文件夹  
mkdir /data/kafka-connect-plugin  
将打包好的maxwell-sink.jar上传进去。 
（要补充下，这个jar必须上传到kafka的libs目录下）

### 新建connect配置文件<a id="sec-1-1-2" name="sec-1-1-2"></a>

在config目录新建一个配置文件maxwell-sink.properties（当然也可以放在其他目录）  
touch maxwell-sin.properties   
内容如下：   
```
\#sink connector config  
name=maxwell-sink  
connector.class=com.cimc.maxwell.sink.MySqlSinkConnector  
tasks.max=1  
topics=estation.db_ez.t_parcel,estation.db_ez.t_box  
max.retries=3  
retry.backoff.ms=1000  

\#mysql config  
mysql.driver=com.mysql.jdbc.Driver  
mysql.username=USERNAME  
mysql.password=PASWWORD  
mysql.url=jdbc:mysql://10.33.1.13:3306?autoReconnect=true&characterEncoding=utf8&allowMultiQueries=true  
mysql.batch.size=500  

\#tables PK config  
tables.pk=db_ez.t_parcel:id,db_ez.t_box:box_id  
\#topic target database  
topic.target.db=estation.db_ez.t_parcel:test,estation.db_ez.t_box:test  
\#filter matches  
filter.conditions=sn:100000A011,100000A012,100000A013;  
```
### 配置plugin.path<a id="sec-1-1-3" name="sec-1-1-3"></a>

在config/connect-standalone.properties和config/connect-distribute.properties中添加：  
plugin.path=/data/kafka-connect-plugin/  
kafka connect会去这个目录查找配置文件中定义的connector.class，也就是com.cimc.maxwell.sink.MySqlSinkConnector。    
（要补充下，好像只有高版本的，这个配置才会生效，可以使用export CLASSPATH的方式，或者上传到kafka的libs目录下）  
之前的版本直接使用的：export CLASSPATH=/data/kafka/libs/maxwell-sink.jar，这种方式非常不好。  

### 启动<a id="sec-1-1-4" name="sec-1-1-4"></a>

Standalone 单机模式下启动  
./bin/connect-standalone.sh config/connect-standalone.properties config/maxwell-sink.properties &  

Distribute 分布式模式下启动  
./bin/connect-distribute.sh config/connect-distribute.properties  
**注意：分布式模式的conntor的配置文件是通过Rest API传递的**  

1.  添加connector  

     以post方式，发送一下内容  
     URL是：<http://localhost:8083/connectors>  
     PostBody是：  
     ```
     {
      "name": "dis-maxwell-sink",
      "config": {
        "name" : "maxwell-sink-song",
        "connector.class" : "com.cimc.maxwell.sink.MySqlSinkConnector",
          "tasks.max": 1,
          "topics": "estation.db_ez.t_parcel,estation.db_ez.t_box  ",
          "max.retries": 3,
          "retry.backoff.ms": 1000,
          "mysql.driver": "com.mysql.jdbc.Driver",
          "mysql.username": "username",
          "mysql.password": "password",
          "mysql.url": "jdbc:mysql://10.33.1.13:3306?autoReconnect=true&characterEncoding=utf8&allowMultiQueries=true",
          "mysql.batch.size": 500,
          "tables.pk": "db_ez.t_parcel:id,db_ez.t_box:box_id",
          "topic.target.db": "estation.db_ez.t_parcel:test,estation.db_ez.t_box:test",
          "filter.conditions": "sn:100000A011,100000A012,100000A013"
      }
    }
    ```
    
    提交之后，Connector就会被启动了。如果被close掉了，消费下status.storage.topic配置的topic中的消息。  

### 监控<a id="sec-1-1-5" name="sec-1-1-5"></a>
目前没有很好的监控方案，Confluent官方出了一个Connector Control Center，是个商业软件，只有30天试用期。安装起来，比较麻烦。  
而且启动之后会生成非常多的杂乱的topic，这些topic主要对应到界面中展示的昨天，7天，30天的数据等等。  

Landoop也出了个UI，但是界面比较粗糙，想了解的见[Github项目地址](https://github.com/Landoop/kafka-connect-ui)  

我们现在的做法是写个定时程序，循环查询connectors和tasks的状态，出现异常了告警。

## 相关推荐文章
[Apache Kafka技术分享](/bigdata/Kafka-Share.html)  
[使用Maxwell Kafka和Maxwell-Sink进行MySql数据同步](/bigdata/MySql-ETL-Using-Maxwell-Kafka-MaxwellSink.html)   
[Kafka消息投递语义-消息不丢失，不重复，不丢不重](/bigdata/Kafka-Message-Delivery-Semantics.html)  