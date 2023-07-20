---
layout: page
title: LVS是什么？
category: ops
tags: [负载均衡,LVS]
keywords:
description:
---

动起来，少想多做。  
其实任何一个行当，最终的结局都是趋向于均值化的，都是趋于死亡的。一条毫无波动的水平线。   


## 什么是虚拟机
Virtual server is a highly scalable and highly available server built on a cluster of real servers.  
读到这句话我就感觉到很惊艳了，原来虚拟机还能这么玩，我以前一直以为虚拟机是在一台实体电脑上安装切分多台虚拟机。  
这里对应到道家的思想，就是分合。你既可以将一台电脑分裂成多台虚拟机，也能将多台电脑合并成一个虚拟机。  
而且这样一合之后，就相当于是封装了，面向对象的4大特征封装，和那个接口化也是一致的，   

而在封装后的里面又能继续分，切割；切割完后的部分，其实也是封装，  
![LVS-Summary](/img/java/ops/2023-07-21-LVS-Summary.png)

但是其实还有一个更本质的看法就是：实体电脑和虚拟电脑本质上是一样的，甚至能进一步抽象就是：都只是一种资源，一个文件罢了。  
再说本质一点就是全部都是数据，二进制，0和1，阴和阳。   

真的是要看英文，一看就懂，一点就通，触类旁通，就感觉别人说的很简洁，很透彻。  

The LVS cluster system is also known as load balancing server cluster.  
LVS集群也被成为服务器端负载均衡集群

appear as a virtual service on a single IP address, and request dispatching can use IP load balancing technolgies or 
application-level load balancing technologies.   
对外提供服务的集群可以看做一个整体单IP的虚拟服务，可以通过IP的负载均衡进行分发，也能通过应用层面进行负载均衡分发。

Scalability of the system is achieved by transparently adding or removing nodes in the cluster.   
横向可扩展性通过透明性的在集群中添加或者删除节点。  


## 设计一个面试题：怎么以最简单最方便快捷的方式设计一个Web服务负载均衡方案？
Currently, the major work of the LVS project is to develop advanced IP load balancing software (IPVS),  
目前，LVS项目的主要工作是开发先进的IP层负载均衡软件，IPVS。应用层KTCPVS，一个集群管理工具。




