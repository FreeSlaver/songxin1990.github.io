---
layout: page
title:  Java面试场景题-优惠券领券活动有库存限制，有总库存和日库存，系统并发度最高 1W TPS，要求设计一个扩展性强的库存系统？
category: interview-question-experience
tags: [场景题]
keywords:
description:
published:  true
---

我把这个问题在详细描述下，现在搞活动，优惠券满5000减1000，主要是iPhone，现在每天最多只卖出100台能用优惠券的活动价iPhone，总库存只能卖出1万台iPhone，
QPS最高1w，如何设计一个扩展性强的库存系统，当然这个库存可以是iPhone，也可以是其他东西，还能是组合满减。

回答：
1.可以设置每日活动库存数量，设置每月活动库存数，总的库存数量，搞个库存设置模板，但是这个不够抽象，不够统一，
可以直接设定，多少时间内，允许卖出多少活动库存数量。因为这个后面可能需要改成一周，一小时，多少分钟内卖出多少库存，
本质上来说就是：多少时间内能够秒杀多少台参加活动的库存。
这个全部弄成后台可配置的，时间单位都能设置，类似线程池。
对应的字段就是：时间长度 timeLength，时间单位timeUnit，参与活动库存数量marketingInventory，总的活动库存数量totalMaketingInventory，
这里为了符合现实逻辑，应该还有一个实际剩余库存数量actualSurplusInventory，这里占时不考虑。

模板设置之后，想怎么设置就怎么设置，比如30秒活动秒杀10台iphone，3个小时秒杀100台iPhone。

系统启动之后，直接将配置好的模板数据，读到redis中，然后每次请求过来，先进行判断，每日的库存是否耗尽，总的库存是否耗尽。

2.第二个问题就是：参与活动的商品模板配置，前面的1解决的是多少时间内多少库存能参与活动，2解决的是有哪些商品能够参与库存活动。
同样的配置模板，对应的字段有：
参与活动商品id：itemId，此商品每日参与数量，总的能参与活动的数量，其实对应到的是能参与活动对应的模板id：inventoryTemplateId，
也就是和上一个表的id做外键关联。
这样用户在点击结算，甚至添加到购物车，甚至直接在页面展示的时候就能显示库存不足，当然后台在结算的时候还需要进行一遍校验。
这里举个复杂点的例子，优惠券满1万减2k，参与活动的有iPhone，ipod耳机，手机贴膜，手提包等。

用户在将iPhone，iPod耳机等加入购物车时，判断此商品对应的活动库存模板中的库存是否已经耗尽，如果已经耗尽，直接在当前页面显示库存不足。
这里有个问题是：比如今天的100个参与活动的库存用完了，但是到了第二天又有100个可用的库存，所以这里要弄一个定时器，到时间重置下这个可用库存数量。

3.第三个问题就是并发度，高峰达到1万 TPS，系统如何去架构设计，配置，抗住这个并发量。
既然已经默认最高时1w tps，那么就不去考虑tps过来之前的前端，网络等方面的优化。
性能的瓶颈一般是IO层的MySQL，1w tps，也就是数据的写入达到1w tps。
单机MySQL的tps上限这个和太多的东西有关了，cpu，机械还是ssd，机械盘其他应用的io频次，tps的具体操作，是批量插入还是更新等等
华为的手册没翻到，翻到了自己公司的测试报告。
16c128g 情况下，mysql8.0 单库，可以支持 2500tps ，50000qps 。

这里假设单机上限就是2k tps，如何解决这个1w tps的问题






