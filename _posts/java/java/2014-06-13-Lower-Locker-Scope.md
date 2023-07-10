---
layout: page

title: 并发性能优化 – 降低锁粒度
category: java
categoryStr: 并发
tags: 
keywords: 
description: 
---




原文链接  作者：Adrianos Dadis　译者：买蓉（sky.mairong@gmail.com）　校对：方腾飞

在高负载多线程应用中性能是非常重要的。为了达到更好的性能，开发者必须意识到并发的重要性。当我们需要使用并发时， 常常有一个资源必须被两个或多个线程共享。

在这种情况下，就存在一个竞争条件，也就是其中一个线程可以得到锁（锁与特定资源绑定），其他想要得到锁的线程会被阻塞。这个同步机制的实现是有代价的，为了向你提供一个好用的同步模型，JVM和操作系统都要消耗资源。有三个最重要的因素使并发的实现会消耗大量资源，它们是：

*上下文切换
*内存同步
*阻塞

为了写出针对同步的优化代码，你必须认识到这三个因素以及如何减少它们。在写这样的代码时你需要注意很多东西。在本文中，我会向你介绍一种通过降低锁粒度的技术来减少这些因素。

让我们从一个基本原则开始：不要长时间持有不必要的锁。

在获得锁之前做完所有需要做的事，只把锁用在需要同步的资源上，用完之后立即释放它。我们来看一个简单的例子：

```

01
public class HelloSync {
02
    private Map dictionary = new HashMap();
03
    public synchronized void borringDeveloper(String key, String value) {
04
        long startTime = (new java.util.Date()).getTime();
05
        value = value + "_"+startTime;
06
        dictionary.put(key, value);
07
        System.out.println("I did this in "+
08
     ((new java.util.Date()).getTime() - startTime)+" miliseconds");
09
    }
10
}

```

在这个例子中，我们违反了基本原则，因为我们创建了两个Date对象，调用了System.out.println()，还做了很多次String连接操作，但唯一需要做同步的操作是“dictionary.put(key, value);”。让我们来修改代码，把同步方法变成只包含这句的同步块，得到下面更优化的代码：

```

01
public class HelloSync {
02
    private Map dictionary = new HashMap();
03
    public void borringDeveloper(String key, String value) {
04
        long startTime = (new java.util.Date()).getTime();
05
        value = value + "_"+startTime;
06
        synchronized (dictionary) {
07
            dictionary.put(key, value);
08
        }
09
        System.out.println("I did this in "+
10
 ((new java.util.Date()).getTime() - startTime)+" miliseconds");
11
    }
12
}

```

上面的代码可以进一步优化，但这里只想传达出这种想法。如果你对如何进一步优化感兴趣，请参考java.util.concurrent.ConcurrentHashMap.

那么，我们怎么降低锁粒度呢？简单来说，就是通过尽可能少的请求锁。基本的想法是，分别用不同的锁来保护同一个类中多个独立的状态变量，而不是对整个类域只使用一个锁。我们来看下面这个我在很多应用中见到过的简单例子：

```

01
public class Grocery {
02
    private final ArrayList fruits = new ArrayList();
03
    private final ArrayList vegetables = new ArrayList();
04
    public synchronized void addFruit(int index, String fruit) {
05
        fruits.add(index, fruit);
06
    }
07
    public synchronized void removeFruit(int index) {
08
        fruits.remove(index);
09
    }
10
    public synchronized void addVegetable(int index, String vegetable) {
11
        vegetables.add(index, vegetable);
12
    }
13
    public synchronized void removeVegetable(int index) {
14
        vegetables.remove(index);
15
    }
16
}

```

杂货店主可以对他的杂货铺中的蔬菜和水果进行添加/删除操作。上面对杂货铺的实现，通过基本的Grocery 锁来保护fruits和vegetables，因为同步是在方法域完成的。事实上，我们可以不使用这个大范围的锁，而是针对每个资源（fruits和vegetables）分别使用一个锁。来看一下改进后的代码：

```

01
public class Grocery {
02
    private final ArrayList fruits = new ArrayList();
03
    private final ArrayList vegetables = new ArrayList();
04
    public void addFruit(int index, String fruit) {
05
        synchronized(fruits) fruits.add(index, fruit);
06
    }
07
    public void removeFruit(int index) {
08
        synchronized(fruits) {fruits.remove(index);}
09
    }
10
    public void addVegetable(int index, String vegetable) {
11
        synchronized(vegetables) vegetables.add(index, vegetable);
12
    }
13
    public void removeVegetable(int index) {
14
        synchronized(vegetables) vegetables.remove(index);
15
    }
16
}

```

在使用了两个锁后（把锁分离），我们会发现比起之前用一个整体锁，锁阻塞的情况更少了。当我们把这个技术用在有中度锁争抢的锁上时，优化提升会更明显。如果把该方法应用到轻微锁争抢的锁上，改进虽然比较小，但还是有效果的。但是如果把它用在有重度锁争抢的锁上时，你必须认识到结果并非总是更好。

请有选择性的使用这个技术。如果你怀疑一个锁是重度争抢锁请按下面的方法来确认是否使用上面的技术：

确认你的产品会有多少争抢度，将这个争抢度乘以三倍或五倍（甚至10倍，如果你想准备的万无一失）

#### 基于这个争抢度做适当的测试

比较两种方案的测试结果，然后挑选出最合适的

用于改进同步性能的技术还有很多，但对所有的技术来说最基本的原则只有一个：不要长时间持有不必要的锁。

这条基本原则可以如我之前向你们解释的那样理解成“尽可能少的请求锁”，也可以有其他解释（实现方法），我将在之后的文章中进一步介绍。

#### 两个最重要的建议：

请了解一下 java.util.concurrent包里的类（及其子包），因为其中有很多聪明而且有用的实现

并发代码大多数都可以通过使用好的设计模式来简化。请将 Enterprise Integration Patterns熟记于心，它们可以让你不必熬夜



