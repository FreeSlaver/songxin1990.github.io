---
layout: page

title: Spring常见高频面试题总结
category: spring
categoryStr: Spring
tags: [interview]
keywords:
description:
---

## 1.ApplicationConext和BeanFactory的区别？
ApplicationContext extends EnvironmentCapable, ListableBeanFactory, HierarchicalBeanFactory,
MessageSource, ApplicationEventPublisher, ResourcePatternResolver

直接看接口就清楚了，BeanFactory是根接口，最基础的Bean容器，可以通过名称获取Bean。
ApplicationConext添加更多的企业级支持，是BeanFactory的超集。
继承中的ListableBeanFactory是继承的BeanFactory，它能枚举所有的Bean并且能根据ClassType获得所有的Bean。
然后EnvironmentCapable接口就是可以指定容器运行环境，就是对应的profile中的开发，测试环境。
HierarchicalBeanFactory就是有层次的BeanFactory，能获取父级的BeanFactory。
MessageSource策略借口用于解析国际化消息的，支持i18n。
ApplicationEventPublisher具有封装事件发布的功能，比如容器完全装配好之后的refresh()事件，就是Dubbo服务暴露调用的，还有afterPropertySet()事件等。
ResourcePatternResolver策略接口，解析资源路径，大概意思是能根据给定的路径，进行不同的解析，比如FileResouce，XMLResouce，ClassPathResouce等
最终都能解析成相应的资源，容器。


The configuration metadata is represented in XML, Java annotations, or Java code.


## 2.AOP是在Spring Bean生命周期的哪一步？？
（1）@Value注解的作用时机在populateBean(beanName, mbd, instanceWrapper)方法内；
（2）处理该注解的后置处理器(BeanPostProcessor)为AutowiredAnnotationBeanPostProcessor 。

## 3.讲讲什么是IOC？
transfers the control of objects or portions of a program to a container or framework.

The advantages of this architecture are:
* decoupling the execution of a task from its implementation
* making it easier to switch between different implementations
* greater modularity of a program
* greater ease in testing a program by isolating a component or mocking its dependencies, and allowing components to communicate through contracts

We can achieve Inversion of Control through various mechanisms such as: Strategy design pattern, Service Locator pattern, Factory pattern, and Dependency Injection (DI).

Dependency injection is a pattern we can use to implement IoC

## 4.Spring如何解决循环依赖？
对象A的属性依赖对象B，对象B又持有对象A属性，这样就导致了循环依赖，
还有一种情况是abc之间依赖，第三种是自身依赖。
Spring通过3级缓存解决循环依赖的问题，会从一级，二级缓存中去找，如果都没找到，
就认为没初始化，同时进行标记有循环依赖，等下下一次循环获取，也就是解析autowire的时候进行复制，存放到一级缓存中，
成熟bean会放入二级缓存，早起bean放入一级缓存，三级缓存存放代理bean。

### 4种情况无法解决循环依赖：
1.多实例bean通过setter注入；2.构造器注入bean的情况；3.单例的代理bean通过setter注入； 4.设置dependson注解。

3.注解@Autowire机制？


4.注解@Value是在Spring Bean生命周期哪一步？


5.SpringBoot自动装配？
