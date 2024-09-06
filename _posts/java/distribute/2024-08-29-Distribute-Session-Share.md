---
layout: page
title: 分布式session共享问题
category: distribute
categoryStr: 分布式
tags:
keywords:
description:
---


1.服务器文件同步：会造成文件重复，资源浪费，不建议。

2.session存数据库：加大数据库压力，不建议。

3.存放在cookie中：cookie不安全，不建议。

4.ip_hash:  如果是局域网的话会造成这个局域的所有用户的ip_hash值都不一样，不建议。

5.存缓存：redis或者memcache，推荐使用。