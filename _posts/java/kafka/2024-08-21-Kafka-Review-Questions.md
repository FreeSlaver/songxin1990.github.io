---
layout: page
title: Kafka复习自我提问，总结
category: kafka
tags:
keywords:
description:
---

## 1.Kafka的高吞吐量是如何实现的？
1.producer端使用了压缩，批处理
2.网络使用了零拷贝机制
3.持久化机制使用顺序写磁盘，page cache技术
4.多分区，多副本，支撑更大的并发度
5.消息消费ack机制使用的只是记录offset
6.可以组成多个CG，消费互不影响

##