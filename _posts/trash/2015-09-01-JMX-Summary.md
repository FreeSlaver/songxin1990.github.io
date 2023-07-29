---
layout: page
breadcrumb: true
title: JMX模块总结
category: trash
categoryStr: 废弃
tags: JMX
keywords: 
description: 
---


最近在给日志系统做一个JMX的功能。主要是想知道日志系统这个黑盒子的运行情况。
记录各种日志的输入吞吐量和输出吞吐量，以及不同日志的路由情况。
效果图是这样。
![public\img\java\JMX-Summary.png]

也就是有日志类型为101,102,103,104,9999这四种类型的日志，然后index属性是它们保存到es中的索引名字，  
mapping是它们保存到es中mapping 的名字，然后inCounter记录每分钟输入的日志量，outCounter记录每分钟输出的日志量，  
errorCounter是记录的每分钟出错的日志量，responseTime是每条日志请求的平均响应时间。  

这里每分钟都是上一分钟的数据，实现的思路就是：  

每次来一条日志，取日志的类型，如果是101，那么将101对应的ServerMonitor中的inCounter加1，  
然后计算出这条日志的相应时间，加到总的responseTime上面，然后从mq中出去的时候将outCounter加1，  
出现问题就将errorCounter加1，一分钟以后，将所有的数据保存到一个map中，  
然后将inCounter，outCounter，errorCounter，totalResponseTime清零。    

JMX的接口中的getInCounter()方法就从这个一直保持不变的map中取值。所以这一分钟得到的所有值都是恒定的，因为是上一分钟的值。  
然后想jmx中注册4个ServerMonitor的实例。使用ServerMonitor中的一个静态类变量referMap来保存这4个ServerMonitor的实例。  
然后一个定时任务，每分钟去遍历refer，然后从中取到ServerMonitor实例，将ServerMonitor实例中的值set到ServerMonitor实例的map中，  
然后将inCounter，outCounter，errorCounter，responseTime清零。  


