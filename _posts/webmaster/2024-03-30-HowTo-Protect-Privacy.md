---
layout: page
title:   普通人如何保护自己的网络隐私
category: webmaster
tags: [隐私,保护]
keywords:
description:
published: true
---

社工库太可怕了，十几亿人都在网上裸奔，撒消息都能给你人肉到，搞不好就被网暴，被网暴的人往往不堪重负。。做出极端行为。

## 1.无意义
不要用任何有意义的字符串，数字串，比如手机号码，QQ号码，邮箱账号，生日账号等等。
能不用真实名字就不用，比如快递填写名字，但是他么的现在都要实名验证，加身份证扫描。。。
所以个人隐私和信息安全监控是悖论，个人有隐私了，然后你做了坏事，公安就很难抓到你。
## 2.无关联性
不要用一个邮箱，手机号，注册登陆n个网站，APP等，

## 3.密码
不要使用同一个密码。不要用生日，QQ号，邮箱账号，手机号等做密码。最好是将明文密码加密后，再截取，再输入。
比如我目前的方案是：MD5（源密码+域名（APP名称，小程序名称）），再截取前8位，这样即使直接明文存进去，
他也只能得到这一个站点，APP的密码，而且彩虹表反向破解，几乎不可能，因为我这截取的，
而我自己忘记密码了，自己MD5（源密码+域名（APP名称，小程序名称））就能得到对应的密码了，最主要一定要记住的源密码，
要足够复杂足够长的，

## 4.链条足够长
就是如果被对方抓到了某一个点的话，他反向追踪你的链条要足够的长，就有概率在其中的某个链条掉链子，失去线索。

## 5.使用开源的软件
国内的屌毛情况，谁都清楚。

## 6.只要一个暴露点，类似编程中的接口




