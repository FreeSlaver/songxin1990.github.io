---
layout: page
title:  Cloudflare使用教程
category: webmaster
tags:
keywords:
description:
published:  false
---

是一个国外的免费CDN服务，


## 搞完发现出个问题，你的网站重定向过多

## 常见问题FAQ
### 该网页无法正常运作 dhgou.com 将您重定向的次数过多。

出现这个问题的原因是因为在 使用WebSocket+TLS+Nginx+CDN在搬瓦工VPS上搭建V2ray 的过程中， 使用了CloudFlare的云解析以及使用了https的关系， 造成http转https，会循环不停地重定向，从而造成跳转中出现了死循环。

解决的方法非常简单，登录你的CloudFlare，在你域名的SSL/TLS目录下，将SSL/TLS encryption mode（SSL/TLS 加密模式）设置为 Full （完全）即可。