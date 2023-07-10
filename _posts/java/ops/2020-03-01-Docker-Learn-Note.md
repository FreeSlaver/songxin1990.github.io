---
layout: page

title: Docker学习笔记总结
category: ops
categoryStr: 分布式
tags:
keywords:
description:
---


### 编译和运行一个镜像，
docker run -d -p 8080:80 docker/getting-started
* -d - run the container in detached mode (in the background)
  以后台方式运行
  -p 88:88 - map port 8080 of the host to port 80 in the container
  将主机的8080端口映射到容器的80端口。

### 什么是容器？  
a container is a sandboxed process on your machine that is isolated from all other processes on the host machine.  
To summarize, a container:
* is a runnable instance of an image. You can create, start, stop, move, or delete a container using the DockerAPI or CLI.
* can be run on local machines, virtual machines or deployed to the cloud.
* is portable (can be run on any OS)
* Containers are isolated from each other and run their own software, binaries, and configurations.

Docker不是容器，是容器化技术，将一个个应用隔离开来，

###什么是容器镜像？

### 什么是Docker file容器文件？
A Dockerfile is simply a text-based script of instructions that is used to create a container image. I
docker build -t getting-started .

jb腾讯云下载很慢啊。首先一个是yum的源，修改成阿里云的，之后是Dockerfiler的alpine镜像源，要改成国内的。
参考https://www.cnblogs.com/xiaoyao404/p/14266360.html

之后又出问题，跑不起来，用Docker ps查看运行的，之后用Docker ps -a查看所有的，  
修改docker中alpine镜像为国内源： 
在Dockerfile中的所有 FROM ...alpine... 语句后面添加如下语句  
RUN set -eux && sed -i 's/dl-cdn.alpinelinux.org/mirrors.ustc.edu.cn/g' /etc/apk/repositories
构建Docker镜像时fetch超时：
使用国内源完全覆盖 /etc/apk/repositories，在Dockerfile中增加
RUN echo -e http://mirrors.ustc.edu.cn/alpine/v3.7/main/ > /etc/apk/repositories

然后这个python2又找不到改成python3可以。

### 腾讯云和Docker端口映射问题  
出了80端口能够映射外，其他的端口都无法访问，无论是外网还是本机，  
使用curl localhost不行，Docker容器的ip和localhost不对应，使用docker inspect containerId | grep ip来查看容器的具体ip
那现在怎么映射到宿主机上？？  
增加放通宿主机到容器的具体IP，iptables -A OUTPUT -d 172.17.0.0/24 -j ACCEPT  
（建议使用该方法，因为容器启动时的网卡模式是不一定的，虚拟网卡不一定对应是docker0）
果然行了，docker run -d -p 8080:80 docker/getting-started  
将主机的8080端口映射到容器的80端口。关键是这2个端口对应关系，Docker的机制是通过监听宿主机的端口来映射到Docker的端口上的。  
另外只设置容器的80是不行的，要在Dockerfile中expose指定的端口号。比如改成  
docker run -d -p 8080:999 docker/getting-started  
你这样自己curl 容器ip:999会被访问拒绝。但是直接curl 容器ip就可以。  

怎么修改docker pull下来的文件？
docker exec -it 容器id sh  
这种进来修改的只是编译好以后的内容，想改源文件，编译以前的东西就不行。  











