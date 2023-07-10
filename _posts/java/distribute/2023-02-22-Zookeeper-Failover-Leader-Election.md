---
layout: page

title: Zookeeper leader选举和failover机制
category: distribute
categoryStr: 分布式
tags:
keywords:
description:
---


## 服务状态
LOOKING：当节点认为群集中没有Leader，服务器会进入LOOKING状态，目的是为了查找或者选举Leader；
FOLLOWING：follower角色；
LEADING：leader角色；
OBSERVING：observer角色；
可以知道Zookeeper是通过自身的状态来区分自己所属的角色，来执行自己应该的任务。


## ZAB状态

Zookeeper还给ZAB定义的4中状态，反应Zookeeper从选举到对外提供服务的过程中的四个步骤。状态枚举定义：

ELECTION: 集群进入选举状态，此过程会选出一个节点作为leader角色；
DISCOVERY：连接上leader，响应leader心跳，并且检测leader的角色是否更改，通过此步骤之后选举出的leader才能执行真正职务；
SYNCHRONIZATION：整个集群都确认leader之后，将会把leader的数据同步到各个节点，保证整个集群的数据一致性；
BROADCAST：过渡到广播状态，集群开始对外提供服务。


## ZXID
Zxid是极为重要的概念，它是一个long型（64位）整数，分为两部分：纪元（epoch）部分和计数器（counter）部分，是一个全局有序的数字。
epoch代表当前集群所属的哪个leader，用epoch代表当前命令的有效性，counter是一个递增的数字。
## 选举

### 选举发生的时机
Leader发生选举有两个时机，一个是服务启动的时候当整个集群都没有leader节点会进入选举状态，如果leader已经存在就会告诉该节点leader的信息，自己连接上leader，整个集群不用进入选举状态。
还有一个就是在服务运行中，可能会出现各种情况，服务宕机、断电、网络延迟很高的时候leader都不能再对外提供服务了，所有当其他几点通过心跳检测到leader失联之后，集群也会进入选举状态。

### 选举规则
当其他节点的纪元比自身高投它，如果纪元相同比较自身的zxid的大小，选举zxid大的节点，这里的zxid代表节点所提交事务最大的id，zxid越大代表该节点的数据越完整。

最后如果epoch和zxid都相等，则比较服务的serverId，这个Id是配置zookeeper集群所配置的

![ZK-Leader-Election](/img/java/distribute/2023-02-22-Zookeeper-Failover-Leader-Election-1.png)

举例
![ZK-Leader-Election](/img/java/distribute/2023-02-22-Zookeeper-Failover-Leader-Election-2.png)


zab在广播状态中保证以下特征

可靠传递:  如果消息m由一台服务器传递，那么它最终将由所有服务器传递。
全局有序: 如果一个消息a在消息b之前被一台服务器交付，那么所有服务器都交付了a和b，并且a先于b。
因果有序: 如果消息a在因果上先于消息b并且二者都被交付，那么a必须排在b之前。

当收到客户端的写请求的时候会经历以下几个步骤：
Leader收到客户端的写请求，生成一个事务（Proposal），其中包含了zxid；
Leader开始广播该事务，需要注意的是所有节点的通讯都是由一个FIFO的队列维护的；
Follower接受到事务之后，将事务写入本地磁盘，写入成功之后返回Leader一个ACK；
Leader收到过半的ACK之后，开始提交本事务，并广播事务提交信息

有以上流程可知，zookeeper通过二阶段提交来保证集群中数据的一致性，因为只需要收到过半的ACK就可以提交事务，所以zookeeper的数据并不是强一致性。

### zab协议的有序性是如何保证的？
第一是，服务之前用TCP协议进行通讯，保证在网络传输中的有序性；  
第二，节点之前都维护了一个FIFO的队列，保证全局有序性；  
第三，通过全局递增的zxid保证因果有序性。  