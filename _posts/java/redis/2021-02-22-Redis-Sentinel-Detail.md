---
layout: page

title: Redis Sentinel详解
category: redis
categoryStr: redis
tags: [redis]
keywords:
description: Redis Sentinel详解
---

参考：https://redis.io/docs/management/sentinel/

## Redis Sentinel哨兵模式，主要致力高可用性。
提供了监控，通知，针对客户端的配置提供服务，

### 监控
哨兵会定时检测master主库和replica副本从库是否正常工作。
### 通知
可以通过API来通知管理员或者其他程序是否出问题。
### 自动的failover机制
主机挂了，哨兵会启用failover进程，将副本从库提升为master。
其他的副本从库会重新配置master，客户端也会得到新master的地址通知。
### 配置提供服务

