---
layout: page

title: 源码阅读个人经验总结
category: java
categoryStr: java
tags:
keywords:
description:
---

## 阅读源代码流程
1.首先看类的结构，大概有哪些方法，方法的作用是什么，有哪些类布类，作用是什么
2.带着具体问题看源码，具体思考是如何实现的，
3.先看源代码，再看注释
3.写的小的例子demo，然后跑起来，debug看每一步数据是怎么变化的
4.做笔记，把以上的每一步的心得都做笔记

现在的核心要义是过面试。

## FactoryBean
就是工程Bean，一种特殊的bean，不支持基于注解的注入，因为会在所有BeanPostProcessor前初始化，
它就一个产生Bean的工厂，支持单例和原型的模式获取bean，主要被内部的AOP实现类ProxyFactoryBean和
JndiObjectFactoryBean使用。所有由FactoryBean产生的bean都有它自身管理，而它自身由BeanFactory管理，包括是否单例的状态。


AOP的实现类ProxyFactoryBean


## Semaphore，
信号量，其实和进程通信的信号量差不多，只是系统的使用阻塞队列，而Java的Semaphore使用的AQS，
具体实现就是：比如设置5个许可证，然后有20个线程去抢，许可证对应类中的permits属性，也就是设置到AQS中的state值，
来一个线程争抢锁时，先入队，然后判断当前节点的头一个是head，如果是，直接争抢锁，state减去1，state减去1后结果大于0，
争抢成功，将head节点释放，当前节点设置为head节点。如果state减去1的结果小雨0，表面许可用完，线程进入队列等待。
然后某个线程用完许可后释放，state加1，会唤醒队列中的等待线程，依此循环。默认使用的非公平共享锁。


## CycleBarrier
是这么个意思，比如3个运动员比赛跑步，必须等待所有人做完热身运动之后，裁判才会吹口哨。
ABC做完热身运动之后，依次调用await方法，这样锁就释放了，能继续下面的跑步动作，而一旦任何一个没有完成热身运动，那么其他的就阻塞等待。
不是基于AQS而是使用的ReetrantLock来实现的，以及它的Condition条件。
A做完热身以后，调用Lock的condition的wait方法，BC同理，之后当这个Lock的state为0的时候，
调用condition的notifyAll方法唤醒所有阻塞等待的线程，并且释放锁，。所以ABC是共享一个Lock的。阻塞等待这个Lock的释放。


## BeanFactoryPostProcess
和BeanPostProcessor是spring框架中具有重量级地位的两个接口，理解了这两个接口的作用，基本就理解spring的核心原理了。为了降低理解难度分两个小节实现。

BeanFactoryPostProcessor是spring提供的容器扩展机制，允许我们在bean实例化之前修改bean的定义信息即BeanDefinition的信息。其重要的实现类有PropertyPlaceholderConfigurer和CustomEditorConfigurer，PropertyPlaceholderConfigurer的作用是用properties文件的配置值替换xml文件中的占位符，

@Value同@Autowired一样，是由AutowiredAnnotationBeanPostProcessor解析处理






