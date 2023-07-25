---
layout: page
title: 简历_宋鑫_Java_10年_2023
category: me
tags:   [resume,简历,Java]
keywords:
description: 走出去，和世界建立深层的联系。
published: false
---

## 联系方式
- 手机：18194089585  
- 邮箱：xinsong666@foxmail.com  
## 自我介绍
- 10年以上一线自研项目开发经验，4年以上大型架构设计经验，3年以上技术团队管理经验
- 在中集电商负责Kafka，Zipkin的技术引进，从0到1，应用场景落地，线上故障解决 
- 具有分布式，高并发，高可用，高拓展，大数据处理的系统架构设计及研发经验
- 主导项目框架设计，改造升级，设计业务架构，数据模型，并推动项目落地
- 具有扎实的技术功底，对Kafka，SpringCloud，Spring，Mybatis等开源项目均读过源码
- 主导的项目类型主要包括电商，供应链，物流，企业管理，财务等
- 对商业逻辑，产品，流量有一定的认知
## 个人信息
- 姓名：宋鑫，性别：男，年龄：32，工作年限：10年  
- 学校：长江大学，专业：计算机科学与技术  
- 个人主页：https://javaclass.net  
- Github: https://github.com/FreeSlaver  
- StackOverflow: https://stackoverflow.com/users/6708214/songxin

## 开源贡献
### Maxwell-sink
https://github.com/FreeSlaver/maxwell-sink  
基于Kafka Connect和Maxwell开发的一个分布式的ETL数据同步工具
### Zipkin brave-sparkjava
https://github.com/openzipkin/brave  
Sparkjava是一个MVC框架，这个PR是Sparkjava的zipkin实现

## 掌握技能

理解IO/NIO，集合等基础框架 
掌握多线程编程，AQS，ReentrantLock，线程池等技术  
理解JVM，垃圾回收器，垃圾回收算法  
熟练掌握Spring，Spring Boot，Spring Cloud等技术  
熟练掌握Redis，Kafka集群部署，监控，线上问题排查解决  
熟练掌握Mybatis，Zookeeper，Dubbo，Zipkin编程  
熟练使用Mysql，掌握事务，索引，查询优化  
熟练使用NoSQL数据库(DynamoDB,MongoDB)的经验   
有微服务架构、领域驱动设计和RESTful API的经验  
有在分布式/基于云的环境中工作的实际经验  
掌握分布式事务，分布式锁，分布式消息一致性实现  
熟练掌握Docker，K8S等容器技术  
熟练掌握Linux服务器命令操作，项目部署等  
熟练使用Idea，SVN，Git，Maven等工具 
熟练阅读英文技术文档，读写能力良好  
精通DevOps、现代构建策略、CI/CD、单元测试和自动化集成测试

## 工作经历
### 2021.08~2022.12　　　　搜了网络    　　　　资深Java工程师    
### 2018.07~2021.07　　　　华付信息    　　　　初级架构师   
### 2016.05~2018.03　　　　中集电商    　　　　高级Java工程师   
### 2012.06~2016.03　　　　中国安防    　　　　软件工程师      

## 项目经验
### 搜了网络　　　　数智化供应链SaaS平台
项目是一个工业品供应链平台，主要为企业客户提供SaaS服务，提高企业数字化管理程度，  
助力企业完成数字化改造，掌握分析企业整体核心数据。主要功能有:客户供应商管理，销售管理，  
采购管理，物料管理，财务管理，合同管理，物流管理，订单管理，权限配置，系统配置等。     
此系统是一个多租户的SaaS系统，可以提供模块化功能服务，为特定租户开发定制化功能。   
#### 技术框架及实现：
SpringCloudAlibaba微服务框架，Nacos统一配置管理，Redis缓存，Kafka消息中间件，  
Mybatis ORM持久化框架， MySQ数据库存储，Docker，K8S等技术。    
#### 岗位职责
本人主要负责基础服务的架构设计，技术选型，框架搭建等,主要的模块包括:    
消息服务message-service，文件服务file-service，鉴权服务auth-service等，   
以及核心功能代码的开发，文档撰写，自测改Bug，及后续系统维护，线上故障解决  
数据库模型设计，索引字段设计，数据库选型和数据库部署操作，  
通过消息中间件Kafka的发布订阅来实现相关人员的消息通知，核心主业务和延时阻塞任务的解耦  


### 中集电商　　　　maxwell-sink ETL数据同步	
为保障e栈服务的稳定性，需要进行服务切分，异地多活，将主从架构的MySQL服务进行切分。  
Maxwell-sink是基于Kafka Connect实现的分布式ETL数据多向同步工具，  
使用maxwell读取mysql binlog，传输到ESB消息总线服务中，  
再使用maxwell-sink进行消费，数据过滤，清洗，转换存储到多个MySQL实例中。  
拥有良好的扩展性，可以通过适配器模式，添加任意其他数据仓库。  

#### 技术框架及实现：
MySQL binlog，Maxwell，Maxwell-sink，Kafka集群，Kafka Connect组件
### 岗位职责 
负责项目技术选型，架构设计，功能实现，技术文档输出，项目部署，维护等  
项目所有功能代码实现，自测改Bug，项目部署，维护等  
对接其他业务系统，开发接口开放平台供第三方调用  
Kafka各种相关问题，内在Bug解决，集群运行状态监控系统搭建
信息过滤清晰，匹配处理采用模板匹配，提高特定有效信息提取  
通过压测进行GC调优，MySQL调优，Kafka性能配置调优  
做Kafka相关技术的分享，提高团队开发整体技术水平  

### 中集电商　　　　快递柜终端智能监控分析系统			
收集3万台快递柜终端存储在12台服务器上的日志数据，对指定终端，箱格，包裹按天周月的时间维度   
进行数据统计分析，输出报表，同时还可以追踪显示包裹的完整运输轨迹，对运营，运维的工作提供数据支持。  
另外还能监控发现故障的终端，主动告警并提交工单系统， 提高运维的工作效率和用户体验。  
#### 技术框架及实现：
使用FileBeats进行日志收集，ElasticSearch存储，Kibana进行分析展示。同时将数据同步至Kafka后进行消费，  
实时统计分析，根据判断条件发现故障终端，主动推送工单系统。同时会调用下发操作指令的接口来解决部分软故障。  
#### 岗位职责
对接原来的EFK系统，并改进系统架构    
搭建Kafka集群，ELK环境部署    
核心功能代码实现，技术文档输出    
生产环境问题追踪，定位解决，并写报告分析故障产生原因及解决方案    
传输时创建线程及对象较多，需要回调，改造为线程池加数据库重试机制    
