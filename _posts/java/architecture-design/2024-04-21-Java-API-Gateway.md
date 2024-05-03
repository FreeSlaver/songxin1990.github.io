---
layout: page
title: Java API网关技术选型与架构设计
category: architecture-design
tags: [API,网关,技术选型]
keywords:
description:
---

## 首先自己想
这辈子就这样了，搞技术，出国，让这两个老狗逼烂去把。

网关在总体上起一个把控的作用，主要是对后续可访问的资源。总的来讲应该有几个方面的：
1. 权限控制，也就是鉴权，哪些资源能够访问，哪些不能，主要就是API接口，也就是后续的数据资源，
2. 安全控制，不能让非法的请求直接绕后门
3. 流量管控，虽然是正常的，有权限访问的，但是因为其他应用故障，或者恶意DDOS攻击，会把系统搞垮
4. 熔断降级
5. 负载均衡，
6. 请求转发
7. 弹力设计网关还可以把弹力设计中的那些异步、重试、幂等、流控、熔断、监视等都可以实现进去。这样，同样可以像 Service Mesh 那样，让应用服务只关心自己的业务逻辑（或是说数据面上的事）而不是控制逻辑（控制面）。
8. 灰度发布、API聚合、API编排。



目前常见的开源网关大致上按照语言分类有如下几类：

Nginx+lua：OpenResty、Kong、Orange、Abtesting gateway 等
Java：Zuul/Zuul2、Spring Cloud Gateway、Kaazing KWG、gravitee、Dromara soul 等
Go：Janus、fagongzi、Grpc-gateway
Dotnet：Ocelot
NodeJS：Express Gateway、Micro Gateway


按照使用数量、成熟度等来划分，主流的有 5个：

OpenResty
Kong
Zuul、Zuul2
Spring Cloud Gateway


















