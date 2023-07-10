---
layout: page

title: Reactor之我见
category: java
categoryStr: 并发
tags: 
keywords: 
description: 
---



在面多网络socket编程的时候，常用的最简单的多线程模式就是来一个socket请求，我新建一个线程来处理这个请求。
这样造成了很多问题:
1.每来一个请求创建一个线程，耗时会十分的严重，维护线程本身也有开销
2.当某一个时刻请求非常多的时候，很有可能内存溢出
3.此系统占用资源太多，容易宕机。

我在写moja的时候，想到既然消息能够缓存，那么socket请求也可以缓存，一切都是数据，都是对象，是现实生活的映射。
所以这里可以使用一个List缓存socket请求，在zeroMQ中也是这么做的。然后使用一个，10个线程大小的线程池替代，循环去这个队列中取。


这里有些需要处理的问题，就是缓存满了，怎么搞，缓存中超时的socket怎么处理，但本文不是探讨这些的。

这样比上面的方式好一些。但是10个线程，如果一个请求，它需要进行读写文件，长时间的占用，导致了阻塞，这样这个线程就一直得不到释放，不会被放入到线程池中，随着时间推移，越来越多的请求像这样阻塞，10个线程很快就用完了，即使socket请求缓存起来了也得不到处理。

所以这个时候就需要使用Reactor这种处理模式。

来了一个socket请求，首先会去selector上注册这个请求事件（读，写事件等。）

Reactor解决的问题就是一个线程如果在读写文件的时候，长时间的阻塞，导致线程占用的问题。
Reactor是一个单独的进程或者线程，它会不断的循环等待，向操作系统查询IO是否就绪，如果就绪就调用之前在Reactor上面注册的handler来进行逻辑处理。也就是线程不会去等待IO就绪，（操作系统中的IO就绪是一个阻塞过程），但是IO操作（将内核中的数据拷贝到线程中）时候依然会阻塞，也就是NIO是阻塞IO，Reactor实现的只是解决了IO就绪期间的阻塞问题。）

看段代码：

```

public void run() {
	try {
               //当前线程没有被打断，类似于ServerSocket中一直监听
		while (!Thread.interrupted()) {
                        //类似ServerSocket.accept()
		selector.select();
                        //从selector中取到注册的事件集合
		Set selected = selector.selectedKeys();
                         //遍历注册的事件集合
		Iterator it = selected.iterator();
		while (it.hasNext()){
                                 //分发事件
			dispatch((SelectionKey) (it.next()));
                        //遍历完之后，清空，继续接受
			selected.clear();
		}
	} catch (IOException ex) { 

	}
}

```

Reactor与Proactor区别
简单来说，Reactor模式里，操作系统只负责通知IO就绪，具体的IO操作（例如读写）仍然是要在业务进程里阻塞的去做的，而Proactor模式则更进一步，由操作系统将IO操作执行好（例如读取，会将数据直接读到内存buffer中），而handler只负责处理自己的逻辑，真正做到了IO与程序处理异步执行。所以我们一般又说Reactor是同步IO，Proactor是异步IO。



