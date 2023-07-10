---
layout: page

title: 电商订单系统设计之订单号生成
category: project
categoryStr: 项目总结
tags: 
keywords: 
description: 
---

2.订单号生成

SnowFlake算法
第 1 位： 符号位，暂时不用。 第 2~42 位：共41位，时间戳，单位是毫秒，可以支撑大约69年 第 43~52 位：共10位，机器ID，最多可容纳1024台机器 第 53~64 位：共12位，序列号，是自增值，表示同一毫秒内产生的ID，单台机器每毫秒最多可生成4096个订单ID
<img src="/img/java/2022-12-10-ECommerce-Order-Design-OrderNo-1.jpg" class="post-img" alt="2022-12-10-ECommerce-Order-Design-OrderNo-1">

```java
/**
* 产生下一个ID
*/
public synchronized long nextId() {
long currStamp = getNewStamp();
if (currStamp < lastStamp) {
throw new RuntimeException("时钟后移，拒绝生成ID！");
}
if (currStamp == lastStamp) {
// 相同毫秒内，序列号自增
sequence = (sequence + 1) & MAX_SEQUENCE;
// 同一毫秒的序列数已经达到最大
if (sequence == 0L) {
currStamp = getNextMill();
}
} else {
// 不同毫秒内，序列号置为0
sequence = 0L;
}
lastStamp = currStamp;
return (currStamp - START_STAMP) << TIMESTAMP_LEFT // 时间戳部分
| machineId << MACHINE_LEFT             // 机器标识部分
| sequence;                             // 序列号部分
}
```
接入非常简单，不需要搭建服务集群，。代码逻辑非常简单，，同一毫秒内，订单ID的序列号自增。同步锁只作用于本机，机器之间互不影响，每毫秒可以生成4百万个订单ID，非常强悍。
雪花算法严重依赖系统时钟。如果时钟回拨，就会生成重复ID。美团的Leaf（美团自研一种分布式ID生成系统），为了解决时钟回拨，引入了zookeeper，原理也很简单，就是比较当前系统时间跟生成节点的时间。





比如双十一秒杀，每毫秒4百万并发还不能满足要求，就可以使用雪花算法和号段模式相结合，比如百度的UidGenerator、滴滴的TinyId。想想也是，号段模式的预先生成ID肯定是高性能分布式订单ID的最终解决方案。
<img src="/img/java/2022-12-10-ECommerce-Order-Design-OrderNo-2.jpg" class="post-img" alt="2022-12-10-ECommerce-Order-Design-OrderNo-2">