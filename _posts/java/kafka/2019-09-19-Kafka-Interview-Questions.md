---
layout: page

title: Kafka常见高频面试题
category: kafka
categoryStr: Kafka
tags: [interview]
keywords: kafka面试题
description: 
---


## Kafka的运行流程是怎么样的？
首先在N台机器上安装好Kafka实例，然后通过./bin/kafka-server.sh启动，使用config中的默认配置文件，配置文件中指定集群ip端口，当前broker的id，zk集群地址， 然后broker会去zk上抢占一个controller。  
之后通过./bin/topics.sh创建主题，设定partition和replica的数量，controller会在对应的broker上创建文件，使用producer.sh向topic中发送消息，到leader partition上，  
leader partition通知flower拉取消息，然后看设置的参数，如果acks=all就需要所有isr中的partition同步拉取完成之后再返回producer成功。  
成功之后，消息的water mark，水位标识也就是offset会后移，这个时候consumer在poll拉取消息的时候就能够看到最新发送的消息。  
然后broker，producer，consumer，topic等的所有元数据信息都保存在zk集群中。  

## 讲讲 kafka 维护消费状态跟踪的方法
大部分消息系统在 broker 端的维护消息被消费的记录：一个消息被分发到consumer 后 broker 就马上进行标记或者等待 customer 的通知后进行标记。  
这样也可以在消息在消费后立马就删除以减少空间占用。但是这样会不会有什么问题呢？如果一条消息发送出去之后就立即被标记为消费过的，旦 consumer 处理消息时失败了（比如程序崩溃）   
消息就丢失了。为了解决这个问题，很多消息系统提供了另外一个个功能：当消息被发送出去之后仅仅被标记为已发送状态，当接到 consumer 已经消费成功的通知后才标记为已被消费的状态。   
这虽然解决了消息丢失的问题，但产生了新问题，首先如果 consumer处理消息成功了但是向 broker 发送响应时失败了，这条消息将被消费两次。  
第二个问题时，broker 必须维护每条消息的状态，并且每次都要先锁住消息然后更改状态然后释放锁。  
这样麻烦又来了，且不说要维护大量的状态数据，比如如果消息发送出去但没有收到消费成功的通知，这条消息将一直处于被锁定的状态，Kafka 采用了不同的策略。  
Topic 被分成了若干分区，每个分区在同一时间只被一个 consumer 消费。这意味着每个分区被消费的消息在日志中的位置仅仅是一个简单的整数：offset。  
这样就很容易标记每个分区消费状态就很容易了，仅仅需要一个整数而已。这样消费状态的跟踪就很简单了。  
这带来了另外一个好处：consumer 可以把 offset 调成一个较老的值，去重新消费老的消息。  
这对传统的消息系统来说看起来有些不可思议，但确实是非常有用的，谁规定了一条消息只能被消费一次呢？  


## LEO、LSO、AR、ISR、HW 都表示什么含义?

LEO:Log End Offset。  
日志末端位移值或末端偏移量，表示日志下一条待插入消息的 位移值。举个例子，如果日志有 10 条消息，位移值从 0 开始，那么，第 10 条消息的位 移值就是 9。此时，LEO = 10。

LSO:Log Stable Offset。  
这是 Kafka 事务的概念。如果你没有使用到事务，那么这个 值不存在(其实也不是不存在，只是设置成一个无意义的值)。该值控制了事务型消费 者能够看到的消息范围。它经常与 Log Start Offset，即日志起始位移值相混淆，因为 有些人将后者缩写成 LSO，这是不对的。在 Kafka 中，LSO 就是指代 Log Stable Offset。

AR:Assigned Replicas。  
AR 是主题被创建后，分区创建时被分配的副本集合，副本个 数由副本因子决定。

ISR:In-Sync Replicas。  
Kafka 中特别重要的概念，指代的是 AR 中那些与 Leader 保 持同步的副本集合。在 AR 中的副本可能不在 ISR 中，但 Leader 副本天然就包含在 ISR 中。关于 ISR，还有一个常见的面试题目是如何判断副本是否应该属于 ISR。目前的判断 依据是:Follower 副本的 LEO 落后 Leader LEO 的时间，是否超过了 Broker 端参数 replica.lag.time.max.ms 值。如果超过了，副本就会被从 ISR 中移除。

HW:高水位值(High watermark)。  
这是控制消费者可读取消息范围的重要字段。一 个普通消费者只能“看到”Leader 副本上介于 Log Start Offset 和 HW(不含)之间的 所有消息。水位以上的消息是对消费者不可见的。关于 HW，问法有很多，我能想到的 最高级的问法，就是让你完整地梳理下 Follower 副本拉取 Leader 副本、执行同步机制 的详细步骤。这就是我们的第 20 道题的题目，一会儿我会给出答案和解析。

## 简述 Follower 副本消息同步的完整流程
首先，Follower 发送 FETCH 请求给 Leader。接着，Leader 会读取底层日志文件中的消息数据，再更新它内存中的 Follower 副本的 LEO 值，更新为 FETCH 请求中的 fetchOffset 值。
最后，尝试更新分区高水位值。Follower 接收到 FETCH 响应之后，会把 消息写入到底层日志，接着更新 LEO 和 HW 值。
Leader 和 Follower 的 HW 值更新时机是不同的，Follower 的 HW 更新永远落后于 Leader 的 HW。这种时间上的错配是造成各种不一致的原因。
