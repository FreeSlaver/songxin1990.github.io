---
layout: page

title: Zookeeper技术分享
category: distribute
categoryStr: 分布式
tags:
keywords:
description:
---

## 什么是Zookeeper？
Zookeeper（以下简称ZK）是一个高可用的分布式协调系统。

ZK是个中心化的服务，为分布式系统提供配置信息维护，命名服务，分布式锁，组服务。
可以用于共识达成，组管理，leader选举和在场协议。


## 总览
众所周知，分布式协调服务经常出问题。特别是竞态条件和死锁。

## 设计目标
### ZK非常简洁
ZK允许分布式进程通过等级制的命名空间来协作，命名空间类似文件系统的树结构。

###ZK是复本制的
![ZK-Service](/img/java/distribute/2023-02-21-Zookeeper-Tech-Share-1.png)

组成ZK集群整体服务的server必须知道相互之间的状态。它们在内存中维护状态镜像，在存储仓库中保存事务日志，持久化快照。

客户端使用TCB连接到唯一的ZK server，使用心跳维持练级。
### ZK是有序的
使用一个数字唯一反应此次更新在所有事务中的顺序。
### ZK很快
特别是读操作，

## 数据模型和等级制的命名空间
### 等级制的命名空间
![ZK-Hierarchical-Namespace](/img/java/distribute/2023-02-21-Zookeeper-Tech-Share-2.png)
### 节点和临时节点
ZK被设计为存储分布式协调数据：状态信息，配置，位置信息等等。所以存储的节点数据都很小。


ZNode维护了一个针对数据改变，ACL改变的版本号，带有时间戳，可以用来进行缓存校验和分布式协调更新。
每当数据更新，版本号都会增长，同时记录时间戳。

每次客户端拉取数据的同时也会获取到数据对应的版本号。

ACL： Access Control List，访问控制列表，说明哪些人能做哪些操作。

临时节点：随着session连接而创建，session关闭后删除。

## 条件式更新和监视器
ZK的节点支持设置监视器，当节点改变时可以触发或者移除监视器。

当监视器触发时，客户端会接受道一个通知，表明节点改变了。

如果客户端和server的服务断了，只会收到一个本地通知。（也就是说在断掉的过程中如果ZNode变化，客户端不会收到通知?）

3.6中添加新特性，客户端可以设置一个永久性的，可递归性的监视器，可以在节点和子节点改变时获得通知，并且不会被移除。

## 保证机制
* Sequential Consistency - Updates from a client will be applied in the order that they were sent.
  顺序一致性-一个客户端的更新会被顺序执行
* Atomicity - Updates either succeed or fail. No partial results.
  原子性-更新要么成功，要么失败，不会有中间态。
* Single System Image - A client will see the same view of the service regardless of the server that it connects to.
  i.e., a client will never see an older view of the system even if the client fails over to a different server with the same session.
  唯一系统镜像- 一个客户端只会看到唯一的相同视图，无论连接道那个服务器上。比如一个客户端永远不会看到系统的过期视图，及时客户端掉线重连道另一台服务器。
* Reliability - Once an update has been applied, it will persist from that time forward until a client overwrites the update.
  可靠性-更新完成之后，将会被持久化，直到下次更新才会改变数据。
* Timeliness - The clients view of the system is guaranteed to be up-to-date within a certain time bound.
  及时性- 客户端看到的系统视图被保证为最新的，仅有一小段时间间隙。

## 简洁的API
* create：新建节点
* delete：删除节点
* exists：判断节点是否存在
* get data：从节点获取数据
* set data：向节点写数据
* get children：遍历一个节点的所有子节点
* sync：等待节点数据的更新被传播


## 实现

![ZK-Service](/img/java/distribute/2023-02-21-Zookeeper-Tech-Share-3.png)

Replicated Database：副本数据库，是一个内存数据库，拥有所有的最新的完整数据的树结构。
更新操作都被记录到磁盘日志用于恢复，写操作会先落盘，之后再被应用道内存数据库。

只有leader负责处理写请求，剩余的followers接受leader投递过来的消息数据。

消息层负责当leader挂掉后的选举和followers的同步。

ZK使用的自己写的原子广播协议。

## 性能
ZK适用与读远远多于写的系统，一般在读写比例10:1达到最优。
10:1读写情况下，3台服务器的QPS在7W左右，5台，7台，9台，13台很接近，在12W左右。
只需要200ms选举leader，


## 参考
[Zookeeper Overview](https://zookeeper.apache.org/doc/r3.8.1/zookeeperOver.html)  
























