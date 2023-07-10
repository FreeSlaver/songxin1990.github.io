---
layout: page

title: Spring Bean的生命周期详解-配图
category: spring
categoryStr: Spring
tags: [Spring bean]
keywords:
description:
---


Spring作为当前Java最流行、最强大的轻量级框架。Spring Bean的生命周期也是面试高频题，了解Spring Bean周期也能更好地帮助我们解决日常开发中的问题。程序员应该都知道Spring的基础容器是ApplicationContext。应很多粉丝的强烈建议，本文我来分析分析 ApplicationContext中Bean的生命周期。ApplicationContext是顶层容器接口BeanFactory的实现类，因此，我们了解了ApplicationContext的生命周期逻辑，也基本上了解了其他类型容器的生命周期逻辑。

1 Spring生命周期流程图
下面先来看一张Spring Bean完整的生命周期流程图，下图描述的是从Spring容器初始化Bean开始直到Spring容器销毁Bean，所经历的关键节点。


<img src="/img/java/2022-06-08-Spring-Bean-LifeCycle-1.webp" class="post-img" alt="2022-06-08-Spring-Bean-LifeCycle-1">

从上图可以看出，Spring Bean的生命周期管理的基本思路是：在Bean出现之前，先准备操作Bean的BeanFactory，然后操作完Bean，所有的Bean也还会交给BeanFactory进行管理。在所有Bean操作准备BeanPostProcessor作为回调。在Bean的完整生命周期管理过程中，经历了以下主要几个步骤：

1.1 Bean创建前的准备阶段
步骤1： Bean容器在配置文件中找到Spring Bean的定义以及相关的配置，如init-method和destroy-method指定的方法。
步骤2： 实例化回调相关的后置处理器如BeanFactoryPostProcessor、BeanPostProcessor、InstantiationAwareBeanPostProcessor等

1.2 创建Bean的实例
步骤3： Srping 容器使用Java反射API创建Bean的实例。
步骤4：扫描Bean声明的属性并解析。

1.3 开始依赖注入
步骤5：开始依赖注入，解析所有需要赋值的属性并赋值。
步骤6：如果Bean类实现BeanNameAware接口，则将通过传递Bean的名称来调用setBeanName()方法。
步骤7：如果Bean类实现BeanFactoryAware接口，则将通过传递BeanFactory对象的实例来调用setBeanFactory()方法。
步骤8：如果有任何与BeanFactory关联的BeanPostProcessors对象已加载Bean，则将在设置Bean属性之前调用postProcessBeforeInitialization()方法。
步骤9：如果Bean类实现了InitializingBean接口，则在设置了配置文件中定义的所有Bean属性后，将调用afterPropertiesSet()方法。

1.4 缓存到Spring容器
步骤10： 如果配置文件中的Bean定义包含init-method属性，则该属性的值将解析为Bean类中的方法名称，并将调用该方法。
步骤11：如果为Bean Factory对象附加了任何Bean 后置处理器，则将调用postProcessAfterInitialization()方法。

1.5 销毁Bean的实例
步骤12：如果Bean类实现DisposableBean接口，则当Application不再需要Bean引用时，将调用destroy()方法。
步骤13：如果配置文件中的Bean定义包含destroy-method属性，那么将调用Bean类中的相应方法定义。

2 代码实战演示
下面我们用一个简单的Bean来演示并观察一下Spring Bean完整的生命周期。

2.1 准备Author类
1、首先是一个简单的Bean，调用Bean自身的方法和Bean级生命周期接口方法，为了方便演示，它实现了BeanNameAware、BeanFactoryAware、InitializingBean和DiposableBean这4个接口，同时添加2个init-method和destory-method方法，对应配置文件中<bean>的init-method和destroy-method。具体代码如下：

```java


package com.tom.lifecycle;

import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.*;

@Slf4j
@Data
public class Author implements BeanFactoryAware, BeanNameAware, InitializingBean, DisposableBean {
private String name;
private String address;
private int age;

    private BeanFactory beanFactory;

    private String beanName;

    public Author() {
        log.info("【构造器】调用Tom类的构造器实例化");
    }

    public void setName(String name) {
        log.info("【注入属性】name");
        this.name = name;
    }

    public void setAddress(String address) {
        log.info("【注入属性】address");
        this.address = address;
    }

    public void setAge(int age) {
        log.info("【注入属性】age");
        this.age = age;
    }

    // 实现BeanFactoryAware接口的方法
    public void setBeanFactory(BeanFactory beanFactory) throws BeansException {
        log.info("【BeanFactoryAware接口】调用setBeanFactory方法");
        this.beanFactory = beanFactory;
    }

    // 实现BeanNameAware接口的方法
    public void setBeanName(String beanName) {
        log.info("【BeanNameAware接口】调用setBeanName方法");
        this.beanName = beanName;
    }

    // 实现DiposibleBean接口的方法
    public void destroy() throws Exception {
        log.info("【DiposibleBean接口】调用destroy方法");
    }

    // 实现InitializingBean接口的方法
    public void afterPropertiesSet() throws Exception {
        log.info("【InitializingBean接口】调用afterPropertiesSet方法");
    }

    // 通过<bean>的init-method属性指定的初始化方法
    public void beanInit() {
        log.info("【init-method】调用<bean>的init-method属性指定的初始化方法");
    }

    // 通过<bean>的destroy-method属性指定的初始化方法
    public void beanDestory() {
        log.info("【destroy-method】调用<bean>的destroy-method属性指定的初始化方法");
    }
}
```
在配置Spring配置文件中加入如下内容：

```xml


    <bean id="author" class="com.tom.lifecycle.Author"
          init-method="beanInit"
          destroy-method="beanDestory"
          scope="singleton"
          p:name="Tom" p:address="湖南长沙" p:age="18"/>

```
2.2 演示BeanFactoryPostProcessor的执行
1.创建GPBeanFactoryPostProcessor类，并实现BeanFactoryPostProcessor接口，具体代码如下：

```java


package com.tom.lifecycle;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanDefinition;
import org.springframework.beans.factory.config.BeanFactoryPostProcessor;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;

@Slf4j
public class GPBeanFactoryPostProcessor implements BeanFactoryPostProcessor{

    public GPBeanFactoryPostProcessor() {
        super();
        log.info("调用BeanFactoryPostProcessor实现类构造器！！");
    }

    public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory) throws BeansException {
        log.info("BeanFactoryPostProcessor调用postProcessBeanFactory方法");
        BeanDefinition bd = configurableListableBeanFactory.getBeanDefinition("author");
        bd.getPropertyValues().addPropertyValue("age", "16");
    }
}

```
2.在配置Spring配置文件中加入如下内容：

```xml
    <bean id="beanFactoryPostProcessor" class="com.tom.lifecycle.GPBeanFactoryPostProcessor" />
```
3.编写测试类BeanLifeCycleTest，具体代码如下：

```java


package com.tom.lifecycle;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;
import org.springframework.context.support.ClassPathXmlApplicationContext;

@Slf4j
public class BeanLifeCycleTest {

    public static void main(String[] args) {

        log.info("====== 开始初始化Spring容器 ========");

        ApplicationContext factory = new ClassPathXmlApplicationContext("application-beans.xml");

        log.info("====== 初始化Spring容器成功 ========");

        //获取Author实例
        Author author = factory.getBean("author", Author.class);

        log.info(author.toString());

        log.info("====== 开始销毁Spring容器 ========");

        ((ClassPathXmlApplicationContext) factory).registerShutdownHook();
    }

}
```
4.运行结果

运行结果如下：

```
15:49:12.477 [main] INFO com.tom.lifecycle.GPBeanPostProcessor - 调用BeanPostProcessor实现类构造器！！
15:49:12.494 [main] INFO com.tom.lifecycle.Author - 【构造器】调用Tom类的构造器实例化
15:49:12.527 [main] INFO com.tom.lifecycle.Author - 【注入属性】address
15:49:12.528 [main] INFO com.tom.lifecycle.Author - 【注入属性】age
15:49:12.528 [main] INFO com.tom.lifecycle.Author - 【注入属性】name
15:49:12.528 [main] INFO com.tom.lifecycle.Author - 【BeanNameAware接口】调用setBeanName方法
15:49:12.528 [main] INFO com.tom.lifecycle.Author - 【BeanFactoryAware接口】调用setBeanFactory方法
15:49:12.528 [main] INFO com.tom.lifecycle.GPBeanPostProcessor - BeanPostProcessor接口方法postProcessBeforeInitialization对属性进行更改
15:49:12.528 [main] INFO com.tom.lifecycle.Author - 【InitializingBean接口】调用afterPropertiesSet方法
15:49:12.528 [main] INFO com.tom.lifecycle.Author - 【init-method】调用<bean>的init-method属性指定的初始化方法
15:49:12.528 [main] INFO com.tom.lifecycle.GPBeanPostProcessor - BeanPostProcessor接口方法postProcessAfterInitialization对属性进行更改
15:49:12.531 [main] INFO com.tom.lifecycle.BeanLifeCycleTest - ====== 初始化Spring容器成功 ========
15:49:12.531 [main] INFO com.tom.lifecycle.BeanLifeCycleTest - Author(name=Tom, address=湖南长沙, age=18, beanFactory=org.springframework.beans.factory.support.DefaultListableBeanFactory@26653222: defining beans [beanPostProcessor,author]; root of factory hierarchy, beanName=author)
15:49:12.531 [main] INFO com.tom.lifecycle.BeanLifeCycleTest - ====== 开始销毁Spring容器 ========
15:49:12.532 [Thread-0] INFO com.tom.lifecycle.Author - 【DiposibleBean接口】调用destroy方法
15:49:12.533 [Thread-0] INFO com.tom.lifecycle.Author - 【destroy-method】调用<bean>的destroy-method属性指定的初始化方法
```
我们看到，整个执行和我们一开始绘制的流程图一致。但是为什么我们要实现BeanFactoryPostProcessor接口呢？我们进入到BeanFactoryPostProcessor的源码如下：


package org.springframework.beans.factory.config;

import org.springframework.beans.BeansException;

public interface BeanFactoryPostProcessor {
void postProcessBeanFactory(ConfigurableListableBeanFactory var1) throws BeansException;
}
BeanFactoryPostProcessor接口只有一个postProcessBeanFactory()方法，BeanFactoryPostProcessor：在BeanFactory标准初始化之后可以进行修改。将加载所有Bean定义，但是还没有实例化Bean。这个方法允许重新覆盖或者添加属性甚至快速的初始化bean。初次看到可能不知道postProcessBeanFactory()到底是干嘛的。要想透彻理解这个方法的作用，下面来进入到BeanFactoryPostProcessor的源码，理解一下postProcessBeanFactory()的参数，我们可以利用这些参数做一些操作。

通过参数来看，只有一个ConfigurableListableBeanFactory类，这个类的可以提供分析、修改Bean定义和预先实例化单例的功能。我们再进入到ConfigurableListableBeanFactory的源码中：

```java


public interface ConfigurableListableBeanFactory extends ListableBeanFactory, AutowireCapableBeanFactory, ConfigurableBeanFactory {

        //忽略被给定注入依赖类型 ，例如String
    void ignoreDependencyType(Class<?> var1);

        //略被给定注入依赖接口 。这个通常被使用由ApplicationContext去注册依赖，可以以多种方式实现。例如BeanFactory通过BeanFactoryAware，ApplicationContext 通过ApplicationContextAware。默认情况下，仅BeanFactoryAware接口是被忽略，需要忽略其他接口，调用此方法
    void ignoreDependencyInterface(Class<?> var1);

        //注册一个特定类型依赖伴随着相应的Autowired值。这个是准备被用于应该可以Autowire而不是在这个工厂被定义的Bean的工厂/上下文引用。例如 将ApplicationContext类型的依赖项解析为Bean所在的ApplicationContext实例。注意~在普通的BeanFactory中没有注册这样的默认类型，甚至连BeanFactory接口本身都没有
    void registerResolvableDependency(Class<?> var1, Object var2);

        //确认这个被指定的Bean是否是一个Autowire候选，将被注入到其他声明匹配类型的依赖的Bean中
    boolean isAutowireCandidate(String var1, DependencyDescriptor var2) throws NoSuchBeanDefinitionException;

        //根据指定的beanName返回被注册的Bean定义，允许访问其属性值和构造函数参数值（可以在BeanFactory后期处理期间被修改）。这个被返回的BeanDefinition对象不应该是副本而是原始在工厂被注册的。这意味着如果需要它可以被转换为更具体的实现类型。注意这个方法只能获得本地工厂BeanDefinition
    BeanDefinition getBeanDefinition(String var1) throws NoSuchBeanDefinitionException;

        //冻结全部Bean定义，给被注册的Bean定义发信号告诉它们今后不再被修改和进一步后续处理。它允许Factory去积极缓存Bean定义元数据
    void freezeConfiguration();

        //返回该工厂的BeanDefinnition是否被冻结
    boolean isConfigurationFrozen();

        //确保所有非懒加载的单例Bean被实例化，包括FactoryBean
    void preInstantiateSingletons() throws BeansException;
}
```
通过以上演示和分析，我们应该大概能够了解ConfigurableListableBeanFactory的作用，基本就都是对于Bean定义的操作。至此我们还没有看到BeanPostProcessor 和InstantiationAwareBeanPostProcessor的调用。下面我们把BeanPostProcessor 和InstantiationAwareBeanPostProcessor的实现补充上来，再看完整的执行流程

2.3 实现BeanPostProcessor
创建GPBeanPostProcessor类，并实现BeanPostProcessor 接口，具体代码如下：

```java


package com.tom.lifecycle;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.config.BeanPostProcessor;

@Slf4j
public class GPBeanPostProcessor implements BeanPostProcessor {

    public GPBeanPostProcessor(){
        log.info("调用BeanPostProcessor实现类构造器！！");
    }
    public Object postProcessBeforeInitialization(Object o, String s) throws BeansException {
        log.info("BeanPostProcessor接口方法postProcessBeforeInitialization对属性进行更改");
        return o;
    }

    public Object postProcessAfterInitialization(Object o, String s) throws BeansException {
        log.info("BeanPostProcessor接口方法postProcessAfterInitialization对属性进行更改");
        return o;
    }
}
```
ApplicationContext 可以在BeanDefinition中自动检测到实现了BeanPostProcessor的Bean，并且把这些Bean应用于随后的Bean创建。普通的BeanFactory允许对后处理器进行程序化注册，通过工厂应用于所有Bean创建。BeanPostProcessor接口中主要有两个方法：

方法名	解释
postProcessBeforeInitialization	在Bean实例化回调（例如InitializingBean的afterPropertiesSet 或者一个定制的init-method）之前应用此BeanPostProcessor
postProcessAfterInitialization	在bean实例化回调（例如InitializingBean的afterPropertiesSet 或者一个定制的init-method）之后应用此BeanPostProcessor
2.4 实现InstantiationAwareBeanPostProcessor
创建GPInstantiationAwareBeanPostProcessor类，并实现InstantiationAwareBeanPostProcessorAdapter接口，具体代码如下：

```java


package com.tom.lifecycle;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.BeansException;
import org.springframework.beans.PropertyValues;
import org.springframework.beans.factory.config.InstantiationAwareBeanPostProcessorAdapter;

import java.beans.PropertyDescriptor;

@Slf4j
public class GPInstantiationAwareBeanPostProcessor  extends InstantiationAwareBeanPostProcessorAdapter {

    public GPInstantiationAwareBeanPostProcessor() {
        super();
        log.info("调用InstantiationAwareBeanPostProcessorAdapter实现类构造器！！");
    }

    // 接口方法、实例化Bean之前调用
    @Override
    public Object postProcessBeforeInstantiation(Class beanClass,String beanName) throws BeansException {
        log.info("InstantiationAwareBeanPostProcessor调用postProcessBeforeInstantiation方法");
        return null;
    }

    // 接口方法、实例化Bean之后调用
    @Override
    public Object postProcessAfterInitialization(Object bean, String beanName) throws BeansException {
        log.info("InstantiationAwareBeanPostProcessor调用postProcessAfterInitialization方法");
        return bean;
    }

    // 接口方法、设置某个属性时调用
    @Override
    public PropertyValues postProcessPropertyValues(PropertyValues pvs, PropertyDescriptor[] pds, Object bean, String beanName) throws BeansException {
        log.info("InstantiationAwareBeanPostProcessor调用postProcessPropertyValues方法");
        return pvs;
    }
}

```
实现InstantiationAwareBeanPostProcessorAdapter的Bean之后，可以在实例化成功之后，做一些校验或者补充些内容或者把Bean包装代理注入。实现InstantiationAwareBeanPostProcessorAdapter的Bean之后，不会影响容器正常处理每一个实例化的Bean，其子类仅仅只是根据需要覆盖父类的方法。

注意，只有在实际需要 InstantiationAwareBeanPostProcessor 功能时才推荐此基类。如果我们所需要的只是简单的BeanPostProcessor功能，那么直接实现更简单的接口即可。
下面详细介绍一下InstantiationAwareBeanPostProcessorAdapter接口中的所有方法：

方法名	解释
postProcessBeforeInstantiation	在实例化目标Bean之前应用此BeanPostProcessor。这个返回的Bean也许是一个代理代替目标Bean，有效地抑制目标Bean的默认实例化。如果此方法返回一个非空对象，则Bean的创建过程将被短路。唯一的进一步处理被应用是BeanPostProcessor.postProcessAfterInitialization(java.lang.Object, java.lang.String)方法（改变了Bean的生命周期实例化之后直接进入BeanPostProcessor.postProcessAfterInitialization）回调来自于配置好的BeanPostProcessors。这个回调将仅被应用于有Bean Class的BeanDefintions。特别是，它不会应用于采用”factory-method“的Bean。后处理器可以实现扩展的SmartInstantiationAwareBeanPostProcessor接口，以便预测它们将返回的Bean对象的类型
postProcessPropertyValues	在工厂将给定的属性值应用到给定的Bean之前，对给定的属性值进行后处理。允许检查全部依赖是否已经全部满足，例如基于一个@Required在Bean属性的Setter方法上。还允许替换要应用的属性值，通常通过基于原始的PropertyValues创建一个新的MutablePropertyValues实例，添加或删除特定的值
postProcessAfterInitialization	在Bean初始化回调（如InitializingBean的afterPropertiesSet或者定制的init-method）之后，应用这个BeanPostProcessor去给一个新的Bean实例。Bean已经配置了属性值，返回的Bean实例可能已经被包装。<br/>如果是FactoryBean，这个回调将为FactoryBean实例和其他被FactoryBean创建的对象所调用。这个post-processor可以通过相应的FactoryBean实例去检查决定是否应用FactoryBean或者被创建的对象或者两个都有。这个回调在一个由InstantiationAwareBeanPostProcessor短路的触发之后将被调用
2.5 修改配置文件
完整的配置文件内容如下：

```xml


<?xml version="1.0" encoding="UTF-8"?>

<beans xmlns="http://www.springframework.org/schema/beans"
xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:p="http://www.springframework.org/schema/p"
xmlns:aop="http://www.springframework.org/schema/aop" xmlns:tx="http://www.springframework.org/schema/tx"
xsi:schemaLocation="
http://www.springframework.org/schema/beans
http://www.springframework.org/schema/beans/spring-beans-3.2.xsd">

        <bean id="beanPostProcessor" class="com.tom.lifecycle.GPBeanPostProcessor" />

        <bean id="beanFactoryPostProcessor" class="com.tom.lifecycle.GPBeanFactoryPostProcessor" />

        <bean id="instantiationAwareBeanPostProcessor" class="com.tom.lifecycle.GPInstantiationAwareBeanPostProcessor" />


        <bean id="author" class="com.tom.lifecycle.Author"
                init-method="beanInit"
                destroy-method="beanDestory"
                scope="singleton"
                p:name="Tom" p:address="湖南长沙" p:age="18"/>

</beans>
```
2.6 运行结果
最后，我们再次运行BeanLifeCycleTest测试类，看到如下运行结果：
```
15:56:20.030 [main] INFO com.tom.lifecycle.GPBeanFactoryPostProcessor - 调用BeanFactoryPostProcessor实现类构造器！！
15:56:20.045 [main] INFO com.tom.lifecycle.GPBeanFactoryPostProcessor - BeanFactoryPostProcessor调用postProcessBeanFactory方法
15:56:20.046 [main] INFO com.tom.lifecycle.GPBeanPostProcessor - 调用BeanPostProcessor实现类构造器！！
15:56:20.047 [main] INFO com.tom.lifecycle.GPInstantiationAwareBeanPostProcessor - 调用InstantiationAwareBeanPostProcessorAdapter实现类构造器！！
15:56:20.051 [main] INFO com.tom.lifecycle.GPInstantiationAwareBeanPostProcessor - InstantiationAwareBeanPostProcessor调用postProcessBeforeInstantiation方法
15:56:20.052 [main] INFO com.tom.lifecycle.Author - 【构造器】调用Tom类的构造器实例化
15:56:20.069 [main] INFO com.tom.lifecycle.GPInstantiationAwareBeanPostProcessor - InstantiationAwareBeanPostProcessor调用postProcessPropertyValues方法
15:56:20.092 [main] INFO com.tom.lifecycle.Author - 【注入属性】address
15:56:20.092 [main] INFO com.tom.lifecycle.Author - 【注入属性】age
15:56:20.092 [main] INFO com.tom.lifecycle.Author - 【注入属性】name
15:56:20.092 [main] INFO com.tom.lifecycle.Author - 【BeanNameAware接口】调用setBeanName方法
15:56:20.092 [main] INFO com.tom.lifecycle.Author - 【BeanFactoryAware接口】调用setBeanFactory方法
15:56:20.093 [main] INFO com.tom.lifecycle.GPBeanPostProcessor - BeanPostProcessor接口方法postProcessBeforeInitialization对属性进行更改
15:56:20.093 [main] INFO com.tom.lifecycle.Author - 【InitializingBean接口】调用afterPropertiesSet方法
15:56:20.093 [main] INFO com.tom.lifecycle.Author - 【init-method】调用<bean>的init-method属性指定的初始化方法
15:56:20.093 [main] INFO com.tom.lifecycle.GPBeanPostProcessor - BeanPostProcessor接口方法postProcessAfterInitialization对属性进行更改
15:56:20.093 [main] INFO com.tom.lifecycle.GPInstantiationAwareBeanPostProcessor - InstantiationAwareBeanPostProcessor调用postProcessAfterInitialization方法
15:56:20.097 [main] INFO com.tom.lifecycle.BeanLifeCycleTest - ====== 初始化Spring容器成功 ========
15:56:20.098 [main] INFO com.tom.lifecycle.BeanLifeCycleTest - Author(name=Tom, address=湖南长沙, age=16, beanFactory=org.springframework.beans.factory.support.DefaultListableBeanFactory@26653222: defining beans [beanPostProcessor,beanFactoryPostProcessor,instantiationAwareBeanPostProcessor,author]; root of factory hierarchy, beanName=author)
15:56:20.098 [main] INFO com.tom.lifecycle.BeanLifeCycleTest - ====== 开始销毁Spring容器 ========
15:56:20.099 [Thread-0] INFO com.tom.lifecycle.Author - 【DiposibleBean接口】调用destroy方法
15:56:20.100 [Thread-0] INFO com.tom.lifecycle.Author - 【destroy-method】调用<bean>的destroy-method属性指定的初始化方法
```
3 Spring Bean生命周期运行时序图
最后我们来看一下完整的执行时序图：

<img src="/img/java/2022-06-08-Spring-Bean-LifeCycle-2.webp" class="post-img" alt="2022-06-08-Spring-Bean-LifeCycle-2">