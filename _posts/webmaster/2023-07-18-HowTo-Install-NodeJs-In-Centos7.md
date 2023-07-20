---
layout: page
title: Centos7如何安装Nodejs和
category: webmaster
tags:
keywords:
description:
published: true
---

curl -sL https://rpm.nodesource.com/setup_10.x | sudo bash -

sudo yum install nodejs


node --version

这样装的不是最新版本的nodejs，

使用这个命令sudo dnf install -y nodejs 安装最新版本的  
dnf没有的话先装dnf  
sudo yum -y install dnf  


还需要单独装npm
sudo yum -y install npm

