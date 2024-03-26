---
layout: page
title:  邮件轰炸，批量发送实现方式
category: net-traffic
tags: [曝光,流量]
keywords:
description:
published:  true
---

因为目前要推广，营销一个产品，所以需要用到邮件批量发送，先用这几乎无成本的方式试试。  
虽然很低级很过时，不过学习下也花不了多少时间。  


第一步得到批量的客户邮箱，我是从社工库中拉的，直接执行SQL语句将数据插入到数据中，然后使用查询语句查出来。
插入数据时候，无法识别中文，