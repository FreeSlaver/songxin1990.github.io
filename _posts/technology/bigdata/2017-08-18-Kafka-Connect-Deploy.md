---
layout: post
title: Kafka Connect Deploy 部署
category: bigdata
tags: kafka
keywords: kafka connect
description: Kafka Connect部署详解，包括添加依赖，部署，打包，配置文件，启动等。
---

<div id="table-of-contents">
<h2>Table of Contents</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Kafka Connect Deploy 部署</a>
<ul>
<li><a href="#sec-1-1">1.1. 编译，部署</a>
<ul>
<li><a href="#sec-1-1-1">1.1.1. 编译，上传jar包</a></li>
<li><a href="#sec-1-1-2">1.1.2. 新建connect配置文件</a></li>
<li><a href="#sec-1-1-3">1.1.3. 配置plugin.path</a></li>
<li><a href="#sec-1-1-4">1.1.4. 启动</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>

# Kafka Connect Deploy 部署<a id="sec-1" name="sec-1"></a>

阅读本文前，请先阅读：
[Kafka Connect Details 详解](http://3gods.com/2017/08/18/Kafka-Connect-Details.html)  
[Kafka Connect Develop Details 开发详解](http://3gods.com/2017/08/18/Kafka-Connect-Develop-Details.html)

## 编译，部署<a id="sec-1-1" name="sec-1-1"></a>

### 编译，上传jar包<a id="sec-1-1-1" name="sec-1-1-1"></a>

新建一个文件夹
mkdir /data/kafka-connect-plugin
将打包好的maxwell-sink.jar上传进去。

### 新建connect配置文件<a id="sec-1-1-2" name="sec-1-1-2"></a>

在config目录新建一个配置文件maxwell-sink.properties（当然也可以放在其他目录）  
touch maxwell-sin.properties  
内容如下：  
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

### 配置plugin.path<a id="sec-1-1-3" name="sec-1-1-3"></a>

在config/connect-standalone.properties和config/connect-distribute.properties中添加：  
plugin.path=/data/kafka-connect-plugin/  
kafka connect会去这个目录查找配置文件中定义的connector.class，也就是com.cimc.maxwell.sink.MySqlSinkConnector。  

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
