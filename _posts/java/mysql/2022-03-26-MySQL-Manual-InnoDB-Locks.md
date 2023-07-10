---
layout: page

title: MySQL官方文档学习笔记-InnoDB锁机制
category: mysql
categoryStr: MySQL
tags:
keywords:
description:
---


**1.共享锁Share Locks和排他锁Exclusive Locks**
也就是s锁和x锁。共享锁就是在事务中的select语句对应的读锁select * from table where id = 1 for update  
排他锁就是事务中的delete或者update语句，事务中说得是手动开启事务以后。  

**2.意图锁Intention Locks**
意图锁是个表级别的锁，分意图共享锁，意图排他锁，会预估推测事务在使用表中一行数据时会使用那种锁s还是x。  
意图锁的作用是：一个事务在获取锁之前先判断它的意图是什么，然后看这个意图锁是否和目前的锁冲突。  

**3.行锁Record Locks**
行锁就是锁在索引记录行上的。
比如SELECT c1 FROM t WHERE c1 = 10 FOR UPDATE;  
prevents any other transaction from inserting, updating, or deleting rows where the value of t.c1 is 10.  
会阻止所有其他插入，更新，删除事务，如果c1满足的值等于10的。  
行锁作用在索引上的，即使没有定义索引，也会使用内置的隐藏聚簇索引来实现行锁。  

**4.间隙锁Gap Locks**
间隙锁就是锁定2个索引记录之间所有数据，或者锁定一个索引记录的前面所有记录，同时锁定另外一个索引的后面所有记录。  
比如SELECT c1 FROM t WHERE c1 BETWEEN 10 and 20 FOR UPDATE  
会阻止插入所有c1的值在10到20范围之间的数据，不管是否真的存在c1相同的记录。  
their only purpose is to prevent other transactions from inserting to the gap  
可以禁用gap lock，将隔离级别从默认的Reateapable Read改成Read Committed，或者启用innodb_locks_unsafe_for_binlog（已废弃）  

间隙锁(Gap Lock)是Innodb在可重复读（Reapteapable Read默认隔离级别）提交下为了解决幻读问题时引入的锁机制  
当使用范围条件而不是相等条件检索数据，并请求共享锁或排他锁时，InnoDB会给符合条件的已有数据记录的索引项加锁；  
对于键值在条件范围内但不存在的记录，叫做“间隙(GAP)”，InnoDB也会对这些“间隙”进行加锁，这种锁机制就是所谓的间隙锁(NEXT-KEY)锁。  

id为主键，所谓的删除其实是做逻辑删除，只是做了状态更改，而不做物理删除。  

**5.Next-Key Locks下一把锁？**
next-key锁就是由行锁和此行记录之前的间隙锁组成的。  

**6.插入意图锁Insert intention Locks**

**7.自动锁 auto-inc Locks**
就是对应的自增长的列的锁，也就是一般用的id列，比如插入一行数据，会等待id自增列生成并且插入成功后才能插入下一条数据。  

