---
layout: page

title: Spring Cloud Gateway动态路由实现的几种方式
category: spring
categoryStr: Spring
tags:
keywords:
description:
---

动态路由有哪些实现方式？
1. Spring Cloud DiscoveryClient

通过在application.properties中设置spring.cloud.gateway.discovery.locator.enabled=true ，同时确保 DiscoveryClient 的实体 (Netflix Eureka, Consul, 或 Zookeeper) 已经生效，即可完成服务的自动发现及注册。

2.Actuator API
创建一个路由关系，需要使用 POST请求到/gateway/routes/{id_route_to_create} 。请求内容为JSON请求体，请求内容参考如下。

```java
{
"id": "first_route",
"predicates": [{
"name": "Path",
"args": {"_genkey_0":"/first"}
}],
"filters": [],
"uri": "https://www.uri-destination.org",
"order": 0}]
```

基于服务注册发现的Spring Cloud DiscoveryClient，需要全部服务在Spring Cloud家族体系下，一旦有外部路由关系，会将思维负载化。
Actuator API是一种外部API调用，虽然能够解决90%以上的问题，但是对于高度定制化的需求，频繁定制增删改查路由的API，难免会有bug，甚至修改时会造成服务的瞬时不可用。

思路一：底层修改，扩展Spring Cloud Gateway底层路由加载机制
通过一定机制，将Spring Cloud Gateway运行态时保存的路由关系，通过实现、继承加载自定义类的方式，对其进行动态路由修改，每当路由有变化时，再触发一次动态的修改。这种思路需要两种保障： 1. 监听机制 2. 实现自定义路由的核心类

思路二：动态修改，请求进来时，以GlobalFilter的方式动态修改路由地址