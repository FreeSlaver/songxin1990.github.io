---
layout: page

title: Zookeeper诀窍和解决方案
category: distribute
categoryStr: 分布式
tags:
keywords:
description:
---

## 指南
ZK是异步通知，但是却能实现同步机制，
When creating a sequential ephemeral node there is an error case in which the create() succeeds on the server but the server crashes before returning the name of the node to the client.

group membership. The group is represented by a node. Members of the group create ephemeral nodes under the group node.

## 栅栏Barriers

Distributed systems use barriers to block processing of a set of nodes until a condition is met at which time all the nodes are allowed to proceed.

使用ZK实现一个栅栏
Client calls the ZooKeeper API's exists() function on the barrier node, with watch set to true.
If exists() returns false, the barrier is gone and the client proceeds
Else, if exists() returns true, the clients wait for a watch event from ZooKeeper for the barrier node.
When the watch event is triggered, the client reissues the exists( ) call, again waiting until the barrier node is removed.

## 双栅栏Double Barriers

## 队列Queue
### 优先级队列

## 锁Lock

## 如何用ZK来进行Leader选举？
简单来说就是使用临时顺序节点，每个参与选举的成员去指定目录注册临时顺序节点。
比如leader_election/guid_000000001，leader_election/guid_000000002，。。。

注册完成之后，最小节点的成员，例如leader_election/guid_000000001成为leader，其他的成为follower。
那每个节点是怎么判断自身是最小的，和为什么成为follower的了？
通过遍历当前目录的所有节点，和自身注册的节点进行比较。

然后每个节点对上一个比自己小的节点设置监视器watch，当leader挂掉之后，第二个节点leader_election/guid_000000002
成为leader，这时会通知其他节点进行主从同步，其他节点也要判断是否有比自身还大的节点。

