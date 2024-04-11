---
layout: page

title: 如何设计一个消息队列系统？
category: interview-question-experience
categoryStr: java
tags: [interview]
keywords:
description:
---


问：如果让你写一个消息队列，该如何进行架构设计？说一下你的思路。
答：首先本着不重复造轮子，可以直接使用Redis的List数据结构做消息队列，但是会有几个问题：
1.Redis使用的内存，在数据量极大的情况下，发生消息堆积如何处理？
2.消费者消费时的消息Ack机制如何设计？
3.如何让支持pub sub这种广播订阅的机制？
4.如何提高并发量？生产者端和消费这端？
5.如何保证高可用性？
6.exactly once如何保证？