---
layout: page

title: Java线程池面试题
category: java
categoryStr: java
tags: [interview]
keywords:
description:
---



## 1.什么是线程池
线程的一种池化技术，避免反复的创建，销毁线程，降低耗时，性能消耗，同时能更好的管理线程资源，
限定资源使用边界，避免造成内存或cpu等资源耗尽，缺点是会浪费额外的一定资源。

## 2.一个线程池包含哪些部分？
包含以下四个基本组成部分：
1、线程池管理器（ThreadPool）：用于创建并管理线程池，包括 创建线程，销毁线程，添加新任务；
2、工作线程（PoolWorker）：线程池中线程，在没有任务时处于等待状态，可以循环的执行任务；
3、任务接口（Task）：每个任务必须实现的接口，以供工作线程调度任务的执行，它主要规定了任务的入口，任务执行完后的收尾工作，任务的执行状态等；
4、任务队列（taskQueue）：用于存放没有处理的任务。提供一种缓冲机制。

## 3.如何创建线程池？
可以通过Executors或者ThreadPoolExecutor，
但是线程池不允许使用Executors去创建，而是通过ThreadPoolExecutor的方式，
1：FixedThreadPool 和 SingleThreadPool：
允许的请求队列（底层实现是LinkedBlockingQueue）长度为Integer.MAX_VALUE，可能会堆积大量的请求，从而导致OOM
2：CachedThreadPool 和 ScheduledThreadPool
允许的创建线程数量为Integer.MAX_VALUE，可能会创建大量的线程，从而导致OOM。

private static ExecutorService executor = new ThreadPoolExecutor(10, 10, 60L, TimeUnit.SECONDS, new ArrayBlockingQueue(10));
对应的创建线程池参数。
public ThreadPoolExecutor(int corePoolSize,
int maximumPoolSize,
long keepAliveTime,
TimeUnit unit,
BlockingQueue<Runnable> workQueue,
ThreadFactory threadFactory,
RejectedExecutionHandler handler) { }
corePoolSize：核心线程数量，会一直存在，除非allowCoreThreadTimeOut设置为true
maximumPoolSize：线程池允许的最大线程池数量
keepAliveTime：线程数量超过corePoolSize，空闲线程的最大超时时间
unit：超时时间的单位
workQueue：工作队列，保存未执行的Runnable 任务
threadFactory：创建线程的工厂类
handler：当线程已满，工作队列也满了的时候，会被调用。被用来实现各种拒绝策略。


## 4.五种线程池的使用场景，是用Executors这个来来调用
* newSingleThreadExecutor：一个单线程的线程池，可以用于需要保证顺序执行的场景，并且只有一个线程在执行。
* newFixedThreadPool：一个固定大小的线程池，可以用于已知并发压力的情况下，对线程数做限制。
* newCachedThreadPool：一个可以无限扩大的线程池，比较适合处理执行时间比较小的任务。
* newScheduledThreadPool：可以延时启动，定时启动的线程池，适用于需要多个后台线程执行周期任务的场景。
* newWorkStealingPool：一个拥有多个任务队列的线程池，可以减少连接数，创建当前可用cpu数量的线程来并行执行。

## 5.说说线程池的拒绝策略
当请求任务不断的过来，而系统此时又处理不过来的时候，我们需要采取的策略是拒绝服务。RejectedExecutionHandler接口提供了拒绝任务处理的自定义方法的机会。在ThreadPoolExecutor中已经包含四种处理策略。
* AbortPolicy策略：该策略会直接抛出异常，阻止系统正常工作。
* CallerRunsPolicy 策略：只要线程池未关闭，该策略直接在调用者线程中，运行当前的被丢弃的任务。
* DiscardOleddestPolicy策略： 该策略将丢弃最老的一个请求，也就是即将被执行的任务，并尝试再次提交当前任务。
* DiscardPolicy策略：该策略默默的丢弃无法处理的任务，不予任何处理。
  除了JDK默认提供的四种拒绝策略，我们可以根据自己的业务需求去自定义拒绝策略，自定义的方式很简单，直接实现RejectedExecutionHandler接口即可。