---
layout: page

title: 索引下推
category: mysql
categoryStr: MySQL
tags: 
keywords:
description:
---


索引下推(Index Condition Pushdown) ICP 是Mysql5.6之后新增的功能，主要的核心点就在于把数据筛选的过程放在了存储引擎层去处理，而不是像之前一样放到Server层去做过滤。

我们执行查询explain SELECT * from user where age >10 and name = 'a'，如下图所示，就会看见Extra中显示了Using index condition，你可能就知道了，这表示出现了索引下推了。


在没有ICP索引下推的时候，这个查询的流程应该是这样（略过无关的细节）：

Mysql Server层调用API查询存储引擎数据
存储引擎根据联合索引首先通过条件找到所有age>10的数据
找到的每一条数据都根据主键索引进行回表查询，直到找到不符合条件的结果
返回数据给Server层，Server根据条件对结果进行过滤，流程结束


而有了ICP之后的流程则是这样：
Mysql Server层调用API查询存储引擎数据
存储引擎根据联合索引首先通过条件找到所有age>10的数据，根据联合索引中已经存在的name数据进行过滤，找到符合条件的数据
根据找到符合条件的数据，回表查询
返回数据给Server层，流程结束