---
layout: page

title: MySQL MVCC机制
category: mysql
categoryStr: MySQL
tags:
keywords:
description:
---


mvcc简单来说就是用来解决读—写冲突的无锁并发控制，就是为事务分配单向增长的时间戳。

为每个数据修改保存一个版本，版本与事务时间戳相关联。

读操作只读取该事务开始前的数据库快照。

解决问题如下：

并发读-写时：可以做到读操作不阻塞写操作，同时写操作也不会阻塞读操作。

解决脏读、幻读、不可重复读等事务隔离问题，但不能解决上面的写-写 更新丢失问题。