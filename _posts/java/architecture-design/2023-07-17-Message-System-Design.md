---
layout: page
title:  消息系统设计原则，必须满足的点
category: architecture-design
tags: [消息系统,程序设计]
keywords:
description:
published:  true
---


消息系统比较关注的是这几个方面，按重要性排序：  
1. 消息可达性，不丢失
发个注册，付款验证码，你这丢了，用户要等1分钟，搞不好订单直接取消
2. 消息不重复
两次重复的消息，用户如果已经使用过就算了，最怕2个不同业务，然后重复发信息，用户搞错顺序
3. 消息低延时
一个验证码等半分钟，次数多了，谁都不想用你家产品  
4. 高峰期支持的并发度
发信息之类的肯定不会同步去发，但是必须得持久化发送的信息，避免信道故障时候的丢失，需要进行重发  
5. 信道故障监控和自动切换
一些突发情况下，某些信道发生故障，必须迅速转换到其他信道，
6. 系统的扩展性和可维护性。


下面分别说说：





