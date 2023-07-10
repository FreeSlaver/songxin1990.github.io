---
layout: page

title: RPC原理以及如何实现一个简单RPC框架
category: java
categoryStr: java
tags:
keywords:
description:
---

## RPC原理

RPC就是Remote Procedure Call，远程方法调用，相较于本地方法调用而言的。
看看本地方法调用过程，一般是New一个对象，然后调用对象的方法，
RPC只是多了一个远程通信的过程以及根据本地类进行反序列化生成类实例的过程。
以常用的Dubbo举例，我们在Spring中配置了远程服务的地址，对象类名称，
然后autowire一个对象，可以在本地直接调用，当调用这个对象的时候，会生成本地一个代理对象一般叫ClientStub，
然后它会将请求参数封装成对象，通过Socket发送请求到远程的服务上，远程服务反序列化，调用本地方法，然后将结果对象序列化在传送回来，

我们依赖的Jar包会根据服务端的对象数据进行反序列化生成对象，然后本地像在远程一样使用。

## TODO 实现一个简单RPC框架
