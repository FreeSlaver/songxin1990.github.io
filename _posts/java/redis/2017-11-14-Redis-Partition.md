---
layout: page

title: Redis Partition分区-翻译
category: redis
categoryStr: redis
tags: [redis,partition,consistent hash,翻译]
keywords: [redis,partition,consistent hash,分区,翻译]
description: 
---
<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Redis Partition分区-翻译</a>
<ul>
<li><a href="#sec-1-1">1.1. 为什么分区有用</a></li>
<li><a href="#sec-1-2">1.2. 分区基本概念</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. 1.根据范围</a></li>
<li><a href="#sec-1-2-2">1.2.2. 2.哈希分区</a></li>
<li><a href="#sec-1-2-3">1.2.3. 预分区哈希</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. 分区的不同实现</a></li>
<li><a href="#sec-1-4">1.4. Redis分区的缺点</a></li>
<li><a href="#sec-1-5">1.5. Redis分区实现方案</a></li>
<li><a href="#sec-1-6">1.6. 参考和扩展阅读</a></li>
</ul>
</li>
</ul>
</div>
</div>



## 为什么分区有用<a id="sec-1-1" name="sec-1-1"></a>

1. 能使用更大的内存数据库  
2. 水平扩展集群，使用更多计算机的内核，宽带  

## 分区基本概念<a id="sec-1-2" name="sec-1-2"></a>

现在有4个Redis实例，R0,R1,R2,R3，可以使用以下方式进行分区  

### 1.根据范围<a id="sec-1-2-1" name="sec-1-2-1"></a>

将ID，如0到1000分到R1,1000到2000分到R2这样。  

缺点：  
需要一个表映射，还要维护这个表，表也要防止单点故障，性能也会下降。  

### 2.哈希分区<a id="sec-1-2-2" name="sec-1-2-2"></a>

将ID进行哈希取值后，对4（Redis实例个数）取模，余数就是对应的Redis实例。  

缺点：  
映射关系不能变，挂掉的实例上的数据提供无法服务，无法在线动态添加，删除节点等。  
可用一致性hash解决以上部分缺点问题。  

### 预分区哈希<a id="sec-1-2-3" name="sec-1-2-3"></a>

我们可以在刚开始的时候，在一台机器上启用很多个redis实例，比如64个。  
然后等数据量增大后，将一台机器上的一半实例迁移到另外一台机器上。  
后续可以继续像这样进行扩展。迁移时按照一下步骤:  
1. 新服务器上启动空闲Redis实例
2. 将数据配置移动到新服务器的新Redis实例上
3. 停止客户端
4. 集群配置中更改成新实例的服务器ip
5. 发送SLAVEOF NO ONE命令到新服务器上的slave实例
6. 更新客户端配置并重启
7. 关闭之前服务器上的旧Redis实例

## 分区的不同实现<a id="sec-1-3" name="sec-1-3"></a>

1. 客户端进行分区  
客户端直接计算出，Key应该去哪个实例读写  
2. 代理进行分区  
客户端请求发送到代理，代理选择正确的Redis实例提供服务  
3. 路由查询分区  
客户端发送请求到任意一个Redis实例，这个实例会转发到正确的节点。  

## Redis分区的缺点<a id="sec-1-4" name="sec-1-4"></a>

1.  对不同节点上的几个key的同时操作一般都不支持
2.  无法支持不同节点上多个key的事务原子性
3.  不支持单key，大量值的分区
4.  数据处理更加复杂，比如要处理多个RDB/AOF文件的合并，备份
5.  添加，删除节点进行扩容，收缩都非常复杂

## Redis分区实现方案<a id="sec-1-5" name="sec-1-5"></a>

1.  Redis Cluster
2.  Twemproxy
3.  客户端支持的一致性哈希

## 参考和扩展阅读<a id="sec-1-6" name="sec-1-6"></a>

[Partitioning: how to split data among multiple Redis instances.](https://redis.io/topics/partitioning)
