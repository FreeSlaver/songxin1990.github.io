---
layout: page

title: MySQL存储引擎及区别
category: mysql
categoryStr: MySQL
tags: 
keywords: 
description: 
---


### Mysql存储引擎有哪些：
1. MyISAM：MySQL5.5前默认的存储引擎，不支持事务，也不支持外键，访问快，提供全文搜索。

MyISAM支持3种不同的存储格式：
- 静态(固定长度)表
- 动态表
- 压缩表
2. InnoDB：提供事务安全表，具有提交、回滚和崩溃恢复能力，唯一支持外键的，支持自动增长列。

对于InnoDB表，自动增长列必须是索引。如果是组合索引，也必须是组合索引的第一列。

3. MERGE：是一组MyISAM表的组合，这些MyISAM表结构必须完全相同，MERGE表中并没有数据，对MERGE类型的表可以进行查询、更新、删除的操作，这些操作实际上是对内部的MyISAM表进行操作。

十分适合 于诸如数据仓储等VLDB环境。

4. MEMORY(HEAP)：使用存在内存中的内容来创建表。每个MEMORY表实际对应一个磁盘文件，格式是.frm，访问速度极快，使用Hash索引。

5. BDB(BerkeleyDB)：可替代InnoDB的事务引擎，支持COMMIT、ROLLBACK和其他事务特性。

6. EXAMPLE：存根引擎，不做什么，主要做服务。

7. FEDERATED：把数据存在远程数据库中。

8. ARCHIVE：为大量很少引用的历史、归档、或安全审计信息的存储和检索。

9. CSV/NDB:簇式数据库引擎，高性能查找，高可用。

10. BLACKHOLE：接受但不存储数据，并且检索总是返回一个空集。


### 支持事务的引擎：
InnoDB和BDB,

剩下的都是非事务的。


### 存储引擎的选择：
主要从以下4个方面考虑：

1. 字段和数据类型的支持，比如BLOG，Text这些对象有些存储引擎不支持。
2. 事务，有的支持事务安全，有的不支持。
3. 索引。
4. 数据库锁。





