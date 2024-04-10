---
layout: page
title: MySQL Binlog
category: mysql
categoryStr: MySQL
tags:
keywords:
description:
---

与innodb引擎中的redo/undo log是完全不同的日志；其主要是用来记录对mysql数据更新或潜在发生更新的SQL语句，并以"事务"的形式保存在磁盘中；
Binlog 记录所有的 DDL 和 DML 语句(除了数据查询语句SELECT、SHOW等)，以 Event 的形式记录，同时记录语句执行时间。

## binlog作用主要有：
主从复制：MySQL Replication在Master端开启binlog，Master把它的二进制日志传递给slaves并回放来达到master-slave数据一致的目的
数据恢复：通过mysqlbinlog工具恢复数据
增量备份

Binlog 包括两类文件：
二进制日志索引文件(.index)：记录所有的二进制文件。
二进制日志文件(.00000*)：记录所有 DDL 和 DML 语句事件。

开启binlogmy.cnf配置中设置：log_bin="存放binlog路径目录"

## binlog常用命令sql
查看binlog相关配置参数：
show variables like '%log_bin%';
查看binlog文件列表,
show binary logs;
查看binlog的状态：
show master status
清空binlog日志文件
reset master

## binlog内容
默认情况下binlog日志是二进制格式，无法直接查看。可使用两种方式进行查看：

### 方法一：使用mysqlbinlog
mysqlbinlog是mysql官方提供的一个binlog查看工具，
mysqlbinlog: /usr/bin/mysqlbinlog  mysql-bin.000007
### 方法二：直接使用SQL语句
SHOW BINLOG EVENTS
[IN 'log_name'] //要查询的binlog文件名
[FROM pos]  
[LIMIT [offset,] row_count]  