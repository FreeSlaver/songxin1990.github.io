---
layout: page

title: Kafka消息投递语义-消息不丢失，不重复，不丢不重
category: kafka
categoryStr: 大数据
redirect_from:
  - /Kafka-Message-Delivery-Semantics
tags: kafka
keywords: kafka,delivery,semantic
description: 本文将讲述kafka支持的3种消息投递语义，以及实现exactly once语义的原理机制。
---
<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Kafka消息投递语义-消息不丢失，不重复，不丢不重</a>
<ul>
<li><a href="#sec-1-1">1.1. 介绍</a></li>
<li><a href="#sec-1-2">1.2. Producer 消息生产者端</a></li>
<li><a href="#sec-1-3">1.3. Broker 消息接收端</a></li>
<li><a href="#sec-1-4">1.4. Consumer 消息消费者端</a></li>
<li><a href="#sec-1-5">1.5. Exactly Once实现原理</a>
<ul>
<li><a href="#sec-1-5-1">1.5.1. Producer端的消息幂等性保证</a></li>
<li><a href="#sec-1-5-2">1.5.2. Transactional Guarantees 事务性保证</a></li>
<li><a href="#sec-1-5-3">1.5.3. Consumer端</a></li>
</ul>
</li>
<li><a href="#sec-1-6">1.6. 参考资料</a></li>
</ul>
</li>
</ul>
</div>
</div>

## 介绍<a id="sec-1-1" name="sec-1-1"></a>

kafka支持3种消息投递语义：  
- At most once——最多一次，消息可能会丢失，但不会重复  
- At least once——最少一次，消息不会丢失，可能会重复  
- Exactly once——只且一次，消息不丢失不重复，只且消费一次。  

但是整体的消息投递语义需要Producer端和Consumer端两者来保证。  

## Producer 消息生产者端<a id="sec-1-2" name="sec-1-2"></a>

一个场景例子：  
当producer向broker发送一条消息，这时网络出错了，producer无法得知broker是否接受到了这条消息。  
网络出错可能是发生在消息传递的过程中，也可能发生在broker已经接受到了消息，并返回ack给producer的过程中。  

这时，producer只能进行重发，消息可能会重复，但是保证了at least once。  

0.11.0的版本通过给每个producer一个唯一ID，并且在每条消息中生成一个sequence num，  
这样就能对消息去重，达到producer端的exactly once。  

这里还涉及到producer端的acks设置和broker端的副本数量，以及min.insync.replicas的设置。  
比如producer端的acks设置如下：  
acks=0  //消息发了就发了，不等任何响应就认为消息发送成功  
acks=1  //leader分片写消息成功就返回响应给producer  
acks=all（-1） //当acks=all， min.insync.replicas=2，就要求INSRNC列表中必须要有2个副本都写成功，才返回响应给producer，  
如果INSRNC中已同步副本数量不足2，就会报异常，如果没有2个副本写成功，也会报异常，消息就会认为没有写成功。  

## Broker 消息接收端<a id="sec-1-3" name="sec-1-3"></a>

上文说过acks=1，表示当leader分片副本写消息成功就返回响应给producer，此时认为消息发送成功。  
如果leader写成功单马上挂了，还没有将这个写成功的消息同步给其他的分片副本，那么这个分片此时的ISR列表为空，  
如果unclean.leader.election.enable=true，就会发生log truncation（日志截取），同样会发生消息丢失。  
如果unclean.leader.election.enable=false，那么这个分片上的服务就不可用了，producer向这个分片发消息就会抛异常。  

所以我们设置min.insync.replicas=2，unclean.leader.election.enable=false，producer端的acks=all，这样发送成功的消息就绝不会丢失。  

## Consumer 消息消费者端<a id="sec-1-4" name="sec-1-4"></a>

所有分片的副本都有自己的log文件（保存消息）和相同的offset值。当consumer没挂的时候，offset直接保存在内存中，  
如果挂了，就会发生负载均衡，需要consumer group中另外的consumer来接管并继续消费。  

consumer消费消息的方式有以下2种;  
1. consumer读取消息，保存offset，然后处理消息。  
现在假设一个场景：保存offset成功，但是消息处理失败，consumer又挂了，这时来接管的consumer  
就只能从上次保存的offset继续消费，这种情况下就有可能丢消息，但是保证了at most once语义。  

2. consumer读取消息，处理消息，处理成功，保存offset。  
如果消息处理成功，但是在保存offset时，consumer挂了，这时来接管的consumer也只能  
从上一次保存的offset开始消费，这时消息就会被重复消费，也就是保证了at least once语义。  

以上这些机制的保证都不是直接一个配置可以解决的，而是你的consumer代码来完成的，只是一个处理顺序先后问题。    
第一种对应的代码：  
```java
List<String> messages = consumer.poll();
consumer.commitOffset();
processMsg(messages);
```

第二种对应的代码：  
```java
List<String> messages = consumer.poll();
processMsg(messages);
consumer.commitOffset();
```

## Exactly Once实现原理<a id="sec-1-5" name="sec-1-5"></a>

下面详细说说exactly once的实现原理。  

### Producer端的消息幂等性保证<a id="sec-1-5-1" name="sec-1-5-1"></a>

每个Producer在初始化的时候都会被分配一个唯一的PID，  
Producer向指定的Topic的特定Partition发送的消息都携带一个sequence number（简称seqNum），从零开始的单调递增的。  

Broker会将Topic-Partition对应的seqNum在内存中维护，每次接受到Producer的消息都会进行校验；  
只有seqNum比上次提交的seqNum刚好大一，才被认为是合法的。比它大的，说明消息有丢失；比它小的，说明消息重复发送了。  

以上说的这个只是针对单个Producer在一个session内的情况，假设Producer挂了，又重新启动一个Producer被而且分配了另外一个PID，  
这样就不能达到防重的目的了，所以kafka又引进了Transactional Guarantees（事务性保证）。  

### Transactional Guarantees 事务性保证<a id="sec-1-5-2" name="sec-1-5-2"></a>

kafka的事务性保证说的是：同时向多个TopicPartitions发送消息，要么都成功，要么都失败。  

为什么搞这么个东西出来？我想了下有可能是这种例子：  
用户定了一张机票，付款成功之后，订单的状态改了，飞机座位也被占了，这样相当于是  
2条消息，那么保证这个事务性就是：向订单状态的Topic和飞机座位的Topic分别发送一条消息，  
这样就需要kafka的这种事务性保证。  

这种功能可以使得consumer offset的提交（也是向broker产生消息）和producer的发送消息绑定在一起。  
用户需要提供一个唯一的全局性TransactionalId，这样就能将PID和TransactionalId映射起来，就能解决  
producer挂掉后跨session的问题，应该是将之前PID的TransactionalId赋值给新的producer。  

### Consumer端<a id="sec-1-5-3" name="sec-1-5-3"></a>

以上的事务性保证只是针对的producer端，对consumer端无法保证，有以下原因：  
1.  压实类型的topics，有些事务消息可能被新版本的producer重写  
2.  事务可能跨坐2个log segments，这时旧的segments可能被删除，就会丢消息  
3.  消费者可能寻址到事务中任意一点，也会丢失一些初始化的消息  
4.  消费者可能不会同时从所有的参与事务的TopicPartitions分片中消费消息  

如果是消费kafka中的topic，并且将结果写回到kafka中另外的topic，  
可以将消息处理后结果的保存和offset的保存绑定为一个事务，这时就能保证  
消息的处理和offset的提交要么都成功，要么都失败。  

如果是将处理消息后的结果保存到外部系统，这时就要用到两阶段提交（tow-phase commit），  
但是这样做很麻烦，较好的方式是offset自己管理，将它和消息的结果保存到同一个地方，整体上进行绑定，   
可以参考Kafka Connect中HDFS的例子。  

## 参考资料及相关阅读<a id="sec-1-6" name="sec-1-6"></a>

[Message Delivery Semantics](https://kafka.apache.org/documentation/#semantics)  
[KIP-98 - Exactly Once Delivery and Transactional Messaging](https://cwiki.apache.org/confluence/display/KAFKA/KIP-98+-+Exactly+Once+Delivery+and+Transactional+Messaging#KIP-98-ExactlyOnceDeliveryandTransactionalMessaging-ProposedChanges)  
[Kafka Connect Details 详解](/Kafka-Connect-Details)  
