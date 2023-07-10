---
layout: page

title: Kafka线上生产环境常见问题及解决方案
category: kafka
categoryStr: Kafka
tags: 
keywords: Kafka线上生产环境
description:
---


## 1.消息堆积一直不消费, 重启服务后开始消费
就是活锁了，有心跳，但是不消费数据，因为consumer持有partition但是却一直没有释放造成了死锁，
原因是消费的太慢了，超过了max.poll.inerval.time。