---
layout: page
title:  货拉拉业务数据
category: interview-question-experience
tags: [QPS,并发量]
keywords:
description:
published:  false
---



货拉拉官方数据显示平台拥有3000万用户数和300万司机数量，月活司机数量约46万，月活跃用户数量600万，司机整体活跃度16%，用户整体活跃度20%。  

货拉拉平台单日订单量约100万+，单均流水约150元，司机人均单量3-5单之间。

算下QPS，RT response time，多少台机器，什么配置，最高并发量，

80%的订单发生在20%的时间，那么就是
80万/（24*60*60*0.2）=46tps，按照读写10:1，QPS也就460？

日活/月活是表示用户参与度的一个常用指标，它是每日活跃用户与每月活跃用户的比率，用百分比来表示。  
通常认为，日活/月活在 20％ 以上的 app 是不错的，超过 50％ 的被形容为世界级。
月活用户600万，日活就是120万，那么PV就是1200万。

1200万，继续按照28来算。
1200万/（24*60*60*0.2）=690,OK，高峰期的QPS大概在700到800，OK，数据搞定，就回答800到900。
那服务器配置？一般机器都是4核8g，多少个微服务？近30个，多少服务器？20多台，具体怎么部署的？这个大概应该是这样部署的。


根据 DAU 估算流量和容量的一般思路
以 DAU = 1000w 为例：
PV
按照日访问量为日活的10倍计算，PV = 1000w * 10 = 1亿
均值QPS
均值 QPS = 访问量/时长 = 1亿/(246060) = 1160
峰值 QPS
峰值 QPS 按照均值的10倍预估 = 11600。考虑到静态资源流量的放大效应，按照放大10倍计算，系统峰值 QPS = 116000
容量
考虑高可用、异地多活等策略，容量x2，QPS = 232000
未来发展
按照未来半年业务增长1.5倍计算，最终 QPS = 232000 * 1.5 = 348000