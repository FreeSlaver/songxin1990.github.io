---
layout: page

title: Google论文之Bigtable详解
category: distribute
categoryStr: 分布式
tags: [paper,bigtable,google,bigdata]
keywords: 
description: 
---

<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. 谷歌论文之Bigtable详解</a>
<ul>
<li><a href="#sec-1-1">1.1. Bigtable是什么</a></li>
<li><a href="#sec-1-2">1.2. Bigtable核心概念</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. column key 列键</a></li>
<li><a href="#sec-1-2-2">1.2.2. column family 列簇</a></li>
<li><a href="#sec-1-2-3">1.2.3. tablet 表块</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. Bigtable Api</a></li>
<li><a href="#sec-1-4">1.4. Bigtable具体实现</a>
<ul>
<li><a href="#sec-1-4-1">1.4.1. tablet的定位</a></li>
<li><a href="#sec-1-4-2">1.4.2. tablet的分配</a></li>
<li><a href="#sec-1-4-3">1.4.3. master的启动和分配过程：</a></li>
<li><a href="#sec-1-4-4">1.4.4. tablet如何服务</a></li>
</ul>
</li>
<li><a href="#sec-1-4">1.4. Bigtable和HBASE，GFS的关系</a></li>
<li><a href="#sec-1-5">1.5. Bigtable的本质和应用</a></li>
<li><a href="#sec-1-6">1.6. Bigtable的开源实现</a></li>
<li><a href="#sec-1-7">1.7. Bigtable的底层依赖</a>
<ul>
<li><a href="#sec-1-7-1">1.7.1. SSTable</a></li>
<li><a href="#sec-1-7-2">1.7.2. Chubby</a></li>
</ul>
</li>
<li><a href="#sec-1-8">1.8. 参考资料和扩展阅读</a></li>
</ul>
</li>
</ul>
</div>
</div>



## Bigtable是什么<a id="sec-1-1" name="sec-1-1"></a>

Bigtable是一个分布式的数据存储系统，用来管理那些被设计为可以横跨上万台机器，达海量级别的结构化数据。  

一个Bigtable是一个稀疏的，分布式的，持久化的，多维度的有序Map。  
这个Map通过行键（row key），列键（column key）和时间戳来进行索引：  
(row:string, column:string, time:int64) → string  

![Google论文之Bigtable详解-图1](/img/life/2017-09-21-Google-Paper-Bigtable1.png)  

上面是一个用于存储海量网页的大表的结构，  
以反转的URL作为row行名，以网页内容contents作为column列名，将网页中的锚点保存在anchor列簇中。   
contents列有3个版本，分别是t3,t5,t6，通过timestamp字段来区分版本。  

Bigtable不支持完整的关系数据模型，相反，它提供给客户端一种非常简单的数据模型，  
能够支持动态的控制数据布局和数据格式（data layout and format），并且允许客户端推导出数据存储在底层具体位置。  

具体的数据是通过行名（row name）和列名（column name）来进行索引的，行名和列名可以是任意的字符串。

客户端可以通过仔细设计的schemas来控制数据的所在位置，以达到是从内存还是磁盘获取数据。  
并且大表Bigtable针对每行（row）的读写都是原子性的。  

为了减轻管理许多不同版本数据的负担，客户端自定义设置保存最后n个或者n天内的数据版本。  

## Bigtable核心概念<a id="sec-1-2" name="sec-1-2"></a>

### column key 列键<a id="sec-1-2-1" name="sec-1-2-1"></a>

列键使用以下语法：列簇名:修饰符。比如上面的anchor:cnnsi.com就是一个列键，列簇名是anchor:，修饰符是cnnsi.com。

### column family 列簇<a id="sec-1-2-2" name="sec-1-2-2"></a>

列键组成在一起的集合称作列簇，是最基本的访问控制单元。  
是将相似的一类信息放在一起，但是却分成多个列来存储，这样是为了高效的读取数据。  

列簇必须先创建，才能在列簇下面的列中进行数据存取。 
在找列簇之前也可以通过指定row keys进行寻址，这样可以更快的定位到数据，具有更佳的性能。

虽然一张大表支持的唯一名列簇的数量较少（最多只有数百），而且列簇在操作期间尽量少改变。
但是，我们可以无限拓展大表中的列数量。

访问控制和磁盘或内存的核算都在列簇级别进行。  

客户端可以将多个列簇组合在一起，成为一个存储位置分组（locality group）。  
针对每个tablet的存储位置分组会生成一个单独的SSTable。  

之所以分开列簇，是为了防止寻找数据时被一起访问，从而更有效的进行数据读取。    

### tablet 表块<a id="sec-1-2-3" name="sec-1-2-3"></a>

和传统关系数据库一样，一个表有很多行（row），由很多行组成的行范围（row range）就是一个tablet（这里翻译为表块），  
比如第1000~1500行，就是一个tablet。表块是被动态划分的（但相邻的应该在一起），它是分发和负载均衡得基本单位。  

## Bigtable Api<a id="sec-1-3" name="sec-1-3"></a>

编程范式：
```
// Open the table
Table \*T = OpenOrDie("*bigtable/web/webtable");
/* Write a new anchor and delete an old anchor
RowMutation r1(T, "com.cnn.www");
r1.Set("anchor:www.c-span.org", "CNN");
r1.Delete("anchor:www.abc.com");
Operation op;
Apply(&op, &r1);

Scanner scanner(T);
ScanStream \*stream;
stream = scanner.FetchColumnFamily("anchor");
stream->SetReturnAllVersions();
scanner.Lookup("com.cnn.www");
for (; !stream->Done(); stream->Next()) {
printf("%s %s %lld %s\n",
scanner.RowName(),
stream->ColumnName(),
stream->MicroTimestamp(),
stream->Value());
}
```

我们可以在遍历的时候传递一个正则表达式的过滤器，过滤后只返回符合条件的数据集。  
除了正则，也支持一种叫Sawzall的脚本语言，可以对数据过滤，转换等操作，求和等操作之后再返回。   

## Bigtable具体实现<a id="sec-1-4" name="sec-1-4"></a>

Bigtable主要由3个部分组成：
- 每个客户端使用的lib
- master服务器
- 多个tablet服务器

master负责分配tablets给tablet服务器，并监控，探测tablet服务器的增加和失效，负责tablet的复杂均衡，对GFS上的文件进行垃圾回收。      

master还处理表或者列簇的创建导致的schema的改变。   

tablet服务器管理一系列的tablets，并负责处理它们的读写请求，以及当tablets太大时的切割操作。   

一个Bigtable集群有许多的大表，每个大表包有一系列的tablets组成，每个tables由一定范围的rows组成。

### tablet的定位<a id="sec-1-4-1" name="sec-1-4-1"></a>

![Google论文之Bigtable详解-图2](/img/life/2017-09-21-Google-Paper-Bigtable2.png)   

Bigtable使用三级层次结构来存储tablet的信息，形成一个类似B+树的结构。  

首层将root tablet的位置信息以文件的形式存储在Chubby中，root tablet包含所有其他tablet的位置信息，  
并将这些信息保存在一个特定的元信息表中（METADATA table），元信息表包含了用户的tablets位置信息。  
root tablet保存在表中第一行，被特殊对待并且永远不会被切分，这是为了保证tablet的位置继承关系不会超过3层。  

客户端的lib缓存tablet的位置信息，这样它就不需要和master通信了。  

### tablet的分配<a id="sec-1-4-2" name="sec-1-4-2"></a>

master负责tablet的分配，并且会追踪，记录存活的tablet服务器列表，及服务器上已分配和未分配的tablets。    

当tablet 服务器启动的时候，会想Chubby注册，
Chubby产生并持有一个独占锁，其实就是在特定目录下的唯一名文件。  

master通过监控Chubby上的这个目录，来发现tablet服务器。  
当tablet服务器停止服务时，会失去这个独占锁，比如因为网络波动导致与Chubby的会话超时。  

tablet服务器会一直重试获取独占锁，如果tablet数据文件还存在。当数据文件被移除后，tablet服务器就会挂掉。  
如果master得知tablet服务器失去了锁，就会将它上面的文件移动到其他存活，可用的服务器上。  

怎么实现的了？master会定时询问tablet服务器关于它锁的状态。如果被告知失去了锁，或者没有响应，  
master会去找Chubby要一个独占锁。如果master能拿到，说明Chubby是存活的，而tablet服务器要么挂了，  
要么是无法和Chubby保持通信，master就会删掉server file（应该是在Chubby上注册的那个锁文件），  
这样就能保证这个tablet服务器不再提供服务。master会将上面的所有tablets状态改成未分配的。  

要保证master和chubby之间的网络不易被攻击，如果master失去与Chubby的会话，就会挂掉。    

### master的启动和分配过程：<a id="sec-1-4-3" name="sec-1-4-3"></a>

1. maset从Chubby抓取一个唯一的master锁，防止并发的maser实例化。
2. master扫描tablet服务器在Chubby上的注册目录
3. master和每个tablet服务器通信，获取tablets的分配情况
4. master扫描元信息表，获取所有的tablets

### tablet如何服务<a id="sec-1-4-4" name="sec-1-4-4"></a>

![Google论文之Bigtable详解-图3](/img/life/2017-09-21-Google-Paper-Bigtable3.png)   

tablet服务器恢复时，会从元信息表中读取元信息。  
元信息，是由多个SSTables组成。SSTable由一个tablet和一系列的重做点（redo points）组成。  
服务器读取SSTables到内存中重建memtable（内存表），通过执行所有的重做点来进行更新，以恢复数据。  

## Bigtable和HBASE，GFS的关系<a id="sec-1-4" name="sec-1-4"></a>

TODO

## Bigtable的本质和应用<a id="sec-1-5" name="sec-1-5"></a>

Bigtable从一种全新的角度来看待数据，它不是一个已经指定的，有固定属性的东西，而是可以不断扩展，具有多维度的东西。  

从横向行row来看，将数据集根据一定的范围进行切分（tablet），并水平分布到多个集群机器上（tablet server）。  
然后通过3级层次结构来定位到最终数据集的位置所在，这样大大降低了检索数据的范围和难度，就是数据以类似树的结构向外不断扩展，而数据的索引像树的根不断收缩。  
拿一颗树来举例：查找数据的过程，类似从树根找树叶，而管理数据的过程，是从树叶到树根。  

从纵向列column来看，column可以无限扩展，也就是看待一个数据的维度变多了，并且这个维度可以无限扩展。  
我们拿一个包裹表为例子，一个包裹表，里面一般有：包裹id，快递员手机号码，用户手机号码，取件时间，终端号，箱格id，  
运单号，预约类型，取件码，预约码等，快递公司，包裹状态，箱格类型，投递时间等。  

我们一般来用传统关系型数据库是：查询终端的包裹，查询快递员的包裹，用户的包裹，用户取件码等等。  
但是其实看待数据可以有另外的方式：我们需要哪些快递员经常使用这个终端，用户取件的时间，频率，用这个终端的快递公司等，  
这样的话，传统关系型数据库就hold不住了。  

这时，就需要bigtable，进行多维度分析，而且特别是包裹数据量后期变得非常大的情况下。而且后续可以很好的进行业务扩展（因为column纵列可以无限扩展。）  

## Bigtable的开源实现<a id="sec-1-6" name="sec-1-6"></a>

目前知道的有hbase，leveldb，rocksdb等，值的一提的还有ssdb这个类似redis的项目。  

## Bigtable的底层依赖<a id="sec-1-7" name="sec-1-7"></a>

Bigtable依赖许多的google的底层组件，有SSTable，Chubby等。  

### SSTable<a id="sec-1-7-1" name="sec-1-7-1"></a>

SSTable是一个不可变的，持久化的，有序的Map，Key和Value都是任意的二进制字符串。  

索引块存储在SSTable的尾部，用来定位数据块，并且在SSTable被打开时，会被载入到内存中。  
首先我们会使用二分查找遍历内存中的索引，然后从磁盘读取。  

### Chubby<a id="sec-1-7-2" name="sec-1-7-2"></a>

请参看我的另外一篇文章：  [Google论文之Chubby](/bigdata/Google-Paper-Chubby.html)

## 参考资料和扩展阅读<a id="sec-1-8" name="sec-1-8"></a>

[Bigtable: A Distributed Storage System for Structured Data](https://static.googleusercontent.com/media/research.google.com/en//archive/bigtable-osdi06.pdf)  
[Understanding HBase and BigTable](https://dzone.com/articles/understanding-hbase-and-bigtab)  
[BigTable 有什么值得称道（牛）的地方？](https://www.zhihu.com/question/19551534)  
