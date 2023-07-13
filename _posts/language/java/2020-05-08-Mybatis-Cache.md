---
layout: page

title: Mybatis一级二级缓存
category: java
categoryStr: java
tags: 
keywords: 
description: 
---


参考：https://developpaper.com/mybatis-mybatis-cache/  
http://www.mybatis.cn/archives/746.html 

一级缓存就是指的sqlsession。缓存的作用域就是sqlsession内，默认开启。 
相同的sql语句查询和查询结果会被缓存起来，如果修改了相关数据会清除缓存。  

二级缓存指的是mapper文件中定义的namespace中配置的一个个的sql语句，  
相同的sql语句查询就会被存到二级缓存中，sqlsession是更大一个级别的缓存。  

mybatis的内部缓存实现用的HashMap，key是hashcode + statementid + SQL statement.  
Value is the Java object mapped to the query result set. 

我们知道，在一级缓存中，不同session进行相同SQL查询的时候，是查询两次数据库的。
显然这是一种浪费，既然SQL查询相同，就没有必要再次查库了，直接利用缓存数据即可， 这种思想就是MyBatis二级缓存的初衷。

Spring和MyBatis整合时，每次查询之后都要进行关闭sqlsession，关闭之后数据被清空。   
所以MyBatis和Spring整合之后，一级缓存是没有意义的。  
如果开启二级缓存，关闭sqlsession后，会把该sqlsession一级缓存中的数据添加到mapper namespace的二级缓存中。   
这样，缓存在sqlsession关闭之后依然存在。  
要启用全局的二级缓存，只需要在SQL映射文件中添加一行：  

<cache/> 
二级缓存是Mapper级别的缓存，多个SqlSession去操作同一个Mapper的sql语句，多个SqlSession可以共用二级缓存，二级缓存是跨SqlSession的。 
 
