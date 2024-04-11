---
layout: page

title: 非科班出生水货硕士阿里新商场面经
category: interview-question-experience
categoryStr: 面试
tags: [阿里巴巴,硕士,]
keywords:
description:
---

**阿里新商场（模拟面试）**

## 个人情况
自我介绍

你为什么学 Java ？

你的计算机专业基础课是怎么学习的？和计算机科班的比较，你觉得你学的比他们更深还是说差不多？

Java 基础

Java 的八种基本数据类型，每个占多少个字节？

Java 中抽象类和接口的区别？

Java 的三大特性

排序算法

讲一下快排的思想

在最好的情况下快排的时间复杂度是多少呢？

快排是如何选择切分元素的？

操作系统

说一下线程和进程，它们之间的区别

线程同步的机制

同步和异步的区别

阻塞和非阻塞的区别

操作系统中死锁的四个必要条件

Java 集合类

ArrayList 初始化时数组的默认长度是多少？

ArrayList 扩容是扩容多少倍？扩容后是用原来的数组还是新的数组？

ArrayList 是一个线程安全的集合类吗？

判断一个集合类是否为线程安全的机制是什么？

说一下 Fail-Fast 机制，结合源码说一下（如果可以的话）

ArrayList 和 LinkedList 的使用场景

说一下 HashMap 的底层数据结构

说一下 HashMap 的存储逻辑（put() 函数）

HashMap 存储元素时 key 完全一样该怎么处理？

HashMap 的默认长度是多少？扩容是扩成几倍？

若两个 key 的 hashcode 值相同但 equals 不同，也就是说它们会插入到同一个桶里，新添加的节点是插入到已有元素的前面还是后面？

为什么 JDK 1.7 是头插法，JDK 1.8 是尾插法？

JDK 1.8 的 HashMap 是否线程安全？

既然 HashMap 不是线程安全的类，有啥办法解决这个问题？

ConcurrentHashMap 和 HashMap 的区别？为什么 ConcurrentHashMap 会线程安全？

ConcurrentHashMap 虽然是线程安全的，但它也存在什么问题？

了解 TreeMap 吗？TreeMap 最大的特点是什么？为什么已经有了 HashMap 了还要有 TreeMap 类？

说一下红黑树的特点

你知道 Http 状态码？302 是代表啥意思？502 是代表啥意思？

线程池

Java 中多线程有哪几种实现方式？

线程池了解吗？说一下为什么要有线程池？

说一下线程池核心的几个参数

JVM

说一下 JVM 的垃圾回收器 CMS G1

说一下 CMS 的优缺点

回收的机制是什么？凭什么判断一个对象会被回收？

说一下 GC Roots 包含哪些内容？

什么情况下会发生新生代 gc？

Eden 区满了之后会怎么样呢？说一下这个处理流程

Eden 区 和 From Survivor 区中经过 gc 后还能存活的对象移动到 To Survivor 区后，
那第二次 GC 时是取 Eden 区和 From Survivor 进行 gc 还是说取 Eden 区和 To Survivor 区？

## 项目
Redis 和 数据库是怎么保持一致性的？

Spring 和 SpringBoot 的区别？

说一下 Spring IOC 和 AOP

说一下 bean 的四个注解，可以让对象注入的注解

说一下你这个项目是根据什么来做的

看你项目中用 Redis 中的 List 来实现异步队列，说一下具体是怎么做的？是如何基于 Redis 来实现异步的？有没有一个拉取消息的过程？还是说基于 Redis 你就把它放到队列里，然后有人来处理还是说订阅处理