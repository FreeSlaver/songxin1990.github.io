---
layout: page

title: ActiveMQ in Action读书笔记
category: kafka
categoryStr: 分布式
tags: MQ Note
keywords: 
description: 
---



### 点对点消息传递域的特点如下：###

每个消息只能有一个消费者。

消息的生产者和消费者之间没有时间上的相关性。无论消费者在生产者发

送消息的时候是否处于运行状态，它都可以提取消息。

### 发布/订阅消息传递域的特点如下：###

每个消息可以有多个消费者。

生产者和消费者之间有时间上的相关性。订阅一个主题的消费者只能消费

自它订阅之后发布的消息。JMS 规范允许客户创建持久订阅，这在一定程

度上放松了时间上的相关性要求。持久订阅允许消费者消费它在未处于激

活状态时发送的消息。 

在点对点消息传递域中，目的地被成为队列（queue）；在发布/订阅消息传递

域中，目的地被成为主题（topic）。

### 消息的消费可以采用以下两种方法之一：###

同步消费。通过调用 消费者的 receive 方法从目的地中显式提取消息。

receive 方法可以一直阻塞到消息到达。

异步消费。客户可以为消费者注册一个消息监听器，以定义在消息到达时

所采取的动作。

### JMS 消息由以下三部分组成：###

消息头。每个消息头字段都有相应的 getter 和 setter 方法。

消息属性。如果需要除消息头字段以外的值，那么可以使用消息属性。

消息体。JMS 定义的消息类型有 TextMessage、MapMessage、BytesMessage、

StreamMessage 和 ObjectMessage。

JMS 消息只有在被确认之后，才认为已经被成功地消费了。消息的成功消费通

常包含三个阶段：客户接收消息、客户处理消息和消息被确认。

还不是说消费者已接收到消息就认为消息消费成功，但是可以在客户接受消息后，不处理消息，返回消息被确认那么这条消息也应该是成功的消费的

在事务性会话中，当一个事务被提交的时候，确认自动发生。在非事务性会

话中，消息何时被确认取决于创建会话时的应答模式（acknowledgement mode）。

该参数有以下三个可选值：

Session.AUTO_ACKNOWLEDGE。

当客户成功的从 receive 方法返回的时候，

或者从 MessageListener.onMessage 方法成功返回的时候，会话自动确认客户收到的消息。

Session.CLIENT_ACKNOWLEDGE。

客户通过消息的 acknowledge 方法确认消息。

需要注意的是，在这种模式中，确认是在会话层上进行：确认一个被

消费的消息将自动确认所有已被会话消费的消息。例如，如果一个消息消

费者消费了 10 个消息，然后确认第 5 个消息，那么所有 10 个消息都被确认。

Session.DUPS_ACKNOWLEDGE。

该选择只是会话迟钝的确认消息的提交。如果 JMS provider 失败，那么可能会导致一些重复的消息。

如果是重复的消息，那么 JMS provider 必须把消息头的 JMSRedelivered 字段设置为

### JMS 支持以下两种消息提交模式：###

PERSISTENT。

指示 JMS provider 持久保存消息，以保证消息不会因为 JMSprovider 的失败而丢失。

NON_PERSISTENT。

不要求 JMS provider 持久保存消息。

可以使用消息优先级来指示 JMS provider 首先提交紧急的消息JMS provider 并不一定保证按照优先级的顺序提交消息

可以设置消息在一定时间后过期，

### 临时目的地###

可以通过会话上的 createTemporaryQueue 方法和 createTemporaryTopic 方

法来创建临时目的地。它们的存在时间只限于创建它们的连接所保持的时间

如果最初创建持久订阅的客户或者任何其它客户使用相同的连接工厂和连接的客户 ID、相同

的主题和相同的订阅名再次调用会话上的 createDurableSubscriber 方法，那么

该持久订阅就会被激活。JMS provider 会向客户发送客户处于非激活状态时所发布的消息。
