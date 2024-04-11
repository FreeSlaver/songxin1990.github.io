---
layout: page
title: Java面试题 - 数据库索引是怎么建的？
category: interview-question-experience
tags: [interview]
keywords:
description:
---

## 面试官问：数据库索引怎么建的？？   

我答：  
首先我们在创建表的时候，
1. 会创建一个id字段作为唯一自增主键，这个也是索引
2. 再接着在一般的业务界面上，都是CRUD，主要是添加数据，删除数据，更新数据，查询数据，  
增删改操作在整个的耗时中索引的影响是很小的，不考虑（那增删改）


  




