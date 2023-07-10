---
layout: page

title: RabbitMQ学习笔记总结
category: java
categoryStr: java
tags: MQ
keywords:
description:
---

学东西先从最基本最核心的概念搞起。
因为我之前搞过Kafka，所以MQ的核心东西都差不多，没那么多时间从GettingStarts学起。

Exchanges：交换机。
消息先发送到交换机，然后由交换机负责路由到不同的队列中，根据header的属性，绑定或者路由key
routes the messages to queues based on header attributes, bindings, and routing keys.。
绑定是交换机和队列间的连接，路由key是消息中的一个属性。
4种交换机：
直连交换机： the message is routed to the queues whose binding key matches the routing key of the message.
队列的绑定key和消息的路由key是相同的。
广播交换机：
主题交换机：可以使用通配符，比如用户主题的消息，就是用户的CRUD的相关消息
消息头交换机：

AMQP核心概念
Server：又称Broker, 接受客户端的连接，实现AMQP实体服务
Connection：连接，应用程序与Broker的网络连接
Channel：网络信道，几乎所有的操作都在Channel中进行，Channel是进行消息读写的通道。客户端可建立多个Channel，每个Channel代表一个会话任务
Message：消息，服务器和应用程序之间传送的数据，由Properties和Body组成。Properties可以对消息进行修饰，比如消息的优先级、延迟等高级特性；Body则就是消息体内容
Virtual host：虚拟主机，用于进行逻辑隔离，就有点类似于NameSpace或Group的概念，是最上层的消息路由。
一个Virtual Host里面可以有若干个Exchange和Queue，同一个Virtual Host里面不能有相同名称的Exchange或Queue
Exchange：交换机，接收消息，根据路由键转发消息到绑定的队列
Binding：Exchange和Queue之间的虚拟连接，binding中可以包含routing key
Routing key：一个路由规则，虚拟机可用它来确定如何路由一个特定消息
Queue：也称为Message Queue，消息队列，保存消息并将它们转发给消费者


RabbitMQ消息投递确认机制：
Producer端
1.通过AMQP事务机制实现，这也是AMQP协议层面提供的解决方案；
2.通过将channel设置成confirm模式来实现；

AMQP事务机制
RabbitMQ中与事务机制有关的方法有三个：txSelect(), txCommit()以及txRollback(),
txSelect用于将当前channel设置成transaction模式，txCommit用于提交事务，txRollback用于回滚事务，
在通过txSelect开启事务之后，我们便可以发布消息给broker代理服务器了，如果txCommit提交成功了，则消息一定到达了broker了，
如果在txCommit执行之前broker异常崩溃或者由于其他原因抛出异常，这个时候我们便可以捕获异常通过txRollback回滚事务了。

producer端confirm模式
生产者将信道设置成confirm模式，一旦信道进入confirm模式，所有在该信道上面发布的消息都会被指派一个唯一的ID(从1开始)，
一旦消息被投递到所有匹配的队列之后，broker就会发送一个确认给生产者（包含消息的唯一ID）,这就使得生产者知道消息已经正确到达目的队列了

confirm模式最大的好处在于他是异步的，一旦发布一条消息，生产者应用程序就可以在等信道返回确认的同时继续发送下一条消息，
当消息最终得到确认之后，生产者应用便可以通过回调方法来处理该确认消息，如果RabbitMQ因为自身内部错误导致消息丢失，就会发送一条nack消息，

消息确认（Consumer端）
消费者在声明队列时，可以指定noAck参数，当noAck=false时，RabbitMQ会一直持有消息直到消费者显式调用basicAck为止。


