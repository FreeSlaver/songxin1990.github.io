---
layout: page

title: 你知道的集群选举方式有哪些？都有什么优缺点，适用场景？
category: java
categoryStr: 分布式
tags: 
keywords:
description:
---

1.最简单的，谁最先抢注了谁当老大，kafka中的Controller就是，如果Controller挂了所有Broker去ZK抢注；
2.直接提升，比如MySQL主从，主机挂了，从机直接拉起做主
3.Raft算法，Redis哨兵的选举方式就是Raft算法
4.ZAB协议，ZK的主节点选举，就是ZAB协议