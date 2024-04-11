---
layout: page

title: Java面试题-JVM调优
category: interview-question-experience
categoryStr: 面试
tags: [interview]
keywords:
description:
---

## 问：做过JVM调优么？怎么做的？

## 何时进行JVM调优
遇到以下情况，就需要考虑进行JVM调优了：
* Heap内存（老年代）持续上涨达到设置的最大内存值；
* Full GC 次数频繁；
* GC 停顿时间过长（超过1秒）；
* 应用出现OutOfMemory 等内存异常；
* 应用中有使用本地缓存且占用大量内存空间；
* 系统吞吐量与响应性能不高或下降。


## 为什么不建议JVM调优？
* 大多数的Java应用不需要进行JVM优化；
* 大多数导致GC问题的原因是代码层面的问题导致的（代码层面）；
* 上线之前，应先考虑将机器的JVM参数设置到最优；
* 减少创建对象的数量（代码层面）；
* 减少使用全局变量和大对象（代码层面）；
* 优先架构调优和代码调优，JVM优化是不得已的手段（代码、架构层面）；
* 分析GC情况优化代码比优化JVM参数更好（代码层面）

## JVM调优目的
低延时，也就是GC停顿的时间尽可能短
高吞吐量，也即GC占用的整个时间尽可能短