---
layout: page

title: InfluxDB介绍
category: ops
categoryStr: 运维监控
tags: 
keywords: InfluxDB monitor introduction
description: InfluxDB introduction
---

<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. InfluxDB介绍</a>
<ul>
<li><a href="#sec-1-1">1.1. 下载，安装，启动服务</a>
<ul>
<li><a href="#sec-1-1-1">1.1.1. 下载</a></li>
<li><a href="#sec-1-1-2">1.1.2. 安装</a></li>
<li><a href="#sec-1-1-3">1.1.3. 启动服务，（建议使用sudo权限）</a></li>
</ul>
</li>
<li><a href="#sec-1-2">1.2. 命令行</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. 开启命令行工具</a></li>
<li><a href="#sec-1-2-2">1.2.2. 新建一个数据库</a></li>
<li><a href="#sec-1-2-3">1.2.3. 展示所有数据库</a></li>
<li><a href="#sec-1-2-4">1.2.4. 使用数据库</a></li>
<li><a href="#sec-1-2-5">1.2.5. 插入</a></li>
<li><a href="#sec-1-2-6">1.2.6. 查询</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. 数据格式</a></li>
<li><a href="#sec-1-4">1.4. 关键概念</a>
<ul>
<li><a href="#sec-1-4-1">1.4.1. Field</a></li>
<li><a href="#sec-1-4-2">1.4.2. Tag</a></li>
<li><a href="#sec-1-4-3">1.4.3. Measurement</a></li>
<li><a href="#sec-1-4-4">1.4.4. Series</a></li>
<li><a href="#sec-1-4-5">1.4.5. Points</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>



InfluxDB是一个时间序列的数据库，主要用来展示监控系统收集到的各种指标。

## 下载，安装，启动服务<a id="sec-1-1" name="sec-1-1"></a>

本文以Centos为例，  其他系统参照：<https://portal.influxdata.com/downloads>。

### 下载<a id="sec-1-1-1" name="sec-1-1-1"></a>

Centos：
wget <https://dl.influxdata.com/influxdb/releases/influxdb-1.3.2.x86_64.rpm>

### 安装<a id="sec-1-1-2" name="sec-1-1-2"></a>

sudo yum localinstall influxdb-1.3.2.x86<sub>64</sub>.rpm

### 启动服务，（建议使用sudo权限）<a id="sec-1-1-3" name="sec-1-1-3"></a>

sudo influxd（或者sudo service influxdb start）

提示信息会看到使用go的1.8.3版本，读取的配置文件所在：Using configuration at: /etc/influxdb/influxdb.conf  
并且会新建一个dir，Using data dir: /var/lib/influxdb/data service=store（所以需要使用sudo权限）

## 命令行<a id="sec-1-2" name="sec-1-2"></a>

The CLI communicates with InfluxDB directly by making requests to the InfluxDB HTTP API over port 8086 by default.  
命令行工具本质上就是通过8086端口发送HTTP请求，来和InfluxDB进行通信的。

InfluxDB非常类似SQL，常用命令非常易懂。

### 开启命令行工具<a id="sec-1-2-1" name="sec-1-2-1"></a>

influx

### 新建一个数据库<a id="sec-1-2-2" name="sec-1-2-2"></a>

CREATE DATABASE db_ez

### 展示所有数据库<a id="sec-1-2-3" name="sec-1-2-3"></a>

SHOW DATABASES
可以看到有一个<sub>internal的db</sub>

_internal database is created and used by InfluxDB to store internal runtime metrics。  
_internal的db是用来存储InfluxDB本身的运行时metrics的。

### 使用数据库<a id="sec-1-2-4" name="sec-1-2-4"></a>

USE db_ez

### 插入<a id="sec-1-2-5" name="sec-1-2-5"></a>

INSERT cpu,host=serverA,region=us<sub>west</sub> value=0.64
INSERT 表名,tag1,ta2 field

### 查询<a id="sec-1-2-6" name="sec-1-2-6"></a>

SELECT "host", "region", "value" FROM "cpu"
字段，表名等都用双引号括起来。

## 数据格式<a id="sec-1-3" name="sec-1-3"></a>

Points are written to InfluxDB using the Line Protocol.  
每个点都是以以下数据格式写入到InfluxDB的：   
\<measurement>\[,<tag-key>=<tag-value>...] <field-key>=<field-value>\[,<field2-key>=<field2-value>...] \[unix-nano-timestamp]

**例子，注意空格和逗号，空格区分的是不同类型的数据，逗号区分的是相同类型的：**    
cpu,host=serverA,region=us<sub>west</sub> value=0.64  
payment,device=mobile,product=Notepad,method=credit billed=33,licenses=3i 1434067467100293230  
stock,symbol=AAPL bid=127.46,ask=127.48  
temperature,machine=unit42,type=assembly external=25,internal=37 1434067467000000000  

## 关键概念<a id="sec-1-4" name="sec-1-4"></a>
```
database           field key        field set  
field value        measurement      point  
retention policy   series           tag key  
tag set            tag value        timestamp  
```

### Field<a id="sec-1-4-1" name="sec-1-4-1"></a>

Field values are your data; they can be strings, floats, integers, or booleans,  
the collection of field-key and field-value pairs make up a field set.  
Fields are a required.  
Field值就是你存储的数据，它们可以是字符串，浮点，整形或者布尔值。  
由Field的key和value组成的键值对的所有集合构成Filed Set。  
Fields是必须的。  

### Tag<a id="sec-1-4-2" name="sec-1-4-2"></a>

Both tag keys and tag values are stored as strings and record metadata.  
The tag key location has two tag values: 1 and 2. The tag key scientist also has two tag values: langstroth and perpetua.  
Tags are optional.  
Tag的键和值都是以字符串保存并记录为元数据的。  
Tag key为location的有2个Tag值，1和2；Tag key为科学家的有2个Tag值，langstroth和perpetua。  
Tag是可选的。  

### Measurement<a id="sec-1-4-3" name="sec-1-4-3"></a>

The measurement acts as a container for tags, fields, and the time column,  
A single measurement can belong to different retention policies. A retention policy describes how long InfluxDB keeps data (DURATION) and  
how many copies of those data are stored in the cluster (REPLICATION).  
Measurement可以认为就是数据库中的一张表，是存储tags，fields和时间列的容器。  
一个Measurement可以属于多个不同的保留策略。一个保留策略就是用来描述：数据保留多长时间和数据的副本数量。  

### Series<a id="sec-1-4-4" name="sec-1-4-4"></a>

a series is the collection of data that share a retention policy, measurement, and tag set.  
一个系列就是拥有相同保留策略，相同表名和标签集合的数据集合。  

下面是一个例子： 
 ```
Arbitrary series number        Retention policy        Measurement        Tag set  
series 1                               autogen                    census                  location = 1,scientist = langstroth
```
系列的编号是series1，保留策略自动，表名：census，标签集合： location = 1,scientist = langstroth。  


Understanding the concept of a series is essential when designing your schema and when working with your data in InfluxDB.  
理解series的概念非常的重要，特别是当你设计表的schema或者使用表中的数据的时候。  
Data in InfluxDB is organized by “time series”, Time series have zero to many points,one for each  sample of the metric.  
InfluxDB中的数据以时间序列组织起来。时间序列有零到许多点，每一个点都是指标的一个单独样本。  

### Points<a id="sec-1-4-5" name="sec-1-4-5"></a>

Points consist of time (a timestamp), a measurement (“cpu_load”, for example), at least one key-value field (the measured value itself, e.g. “value=0.64”, or “temperature=21.2”),  
and zero to many key-value tags containing any metadata about the value (e.g. “host=server01”, “region=EMEA”, “dc=Frankfurt”).  
点集包含时间，表名，至少一个field，零到多个的tags。  

Conceptually you can think of a measurement as an SQL table, where the primary index is always time. tags and fields are effectively columns in the table. tags are indexed, and fields are not.  
概念上来说，你可以将measurement看做SQL的表，唯一索引永远是时间，fields就是表中的列。tags是索引，而fields不是。  
