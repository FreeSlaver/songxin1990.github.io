---
layout: page

title: K8S学习笔记总结
category: ops
categoryStr: 分布式
tags:
keywords:
description:
---

K8S这玩意感觉比Docker难理解多了，简单来看K8S就是一种Docker分布式集群管理技术。
建议看官方文档https://kubernetes.io/ 一步步来，不然绝对弄得你晕头转向，不是你蠢，而是国内的文章写的蠢。  
### 什么是K8S？
<img src="/img/java/2020-04-05-K8S-Learn-Note-1.svg" class="post-img" alt="2020-04-05-K8S-Learn-Note-1.svg">
There was no way to define resource boundaries for applications in a physical server, and this caused resource allocation issues.  
没办法定义资源分配边界，解决办法就是将多个应用部署到多台服务器上，但是会造成1.资源浪费；2.运维管理成本提高。  

图2通过虚拟机来进行资源隔离，但是虚拟机本身就是重量级的，因为每个虚拟机都必须装个操作系统。  

容器化技术更加轻量而且能共享同一个操作系统，本身占用的资源更少。而且优点还有：  
1.敏捷应用的创建和部署，  
* Agile application creation and deployment: increased ease and efficiency of container image creation compared to VM image use.
* Continuous development, integration, and deployment: provides for reliable and frequent container image build and deployment with quick and efficient rollbacks (due to image immutability).
* Dev and Ops separation of concerns: create application container images at build/release time rather than deployment time, thereby decoupling applications from infrastructure.
* Observability: not only surfaces OS-level information and metrics, but also application health and other signals.
* Environmental consistency across development, testing, and production: Runs the same on a laptop as it does in the cloud.
* Cloud and OS distribution portability: Runs on Ubuntu, RHEL, CoreOS, on-premises, on major public clouds, and anywhere else.
* Application-centric management: Raises the level of abstraction from running an OS on virtual hardware to running an application on an OS using logical resources.
* Loosely coupled, distributed, elastic, liberated micro-services: applications are broken into smaller, independent pieces and can be deployed and managed dynamically – not a monolithic stack running on one big single-purpose machine.
* Resource isolation: predictable application performance.
* Resource utilization: high efficiency and density


### K8S有哪些功能作用？
<img src="/img/java/2020-04-05-K8S-Learn-Note-2.svg" class="post-img" alt="2020-04-05-K8S-Learn-Note-2.svg">


### 安装K8S
可以先安装一个kubectl工具，但是差异必须在一个小版本号以内。
因为google的源无法安装要改成国内阿里云的，
```bash
cat <<EOF > /etc/yum.repos.d/kubernetes.repo
[kubernetes]
name=Kubernetes
baseurl=https://mirrors.aliyun.com/kubernetes/yum/repos/kubernetes-el7-x86_64/
enabled=1
gpgcheck=1
repo_gpgcheck=1
gpgkey=https://mirrors.aliyun.com/kubernetes/yum/doc/yum-key.gpg https://mirrors.aliyun.com/kubernetes/yum/doc/rpm-package-key.gpg
exclude=kube*
EOF
```

```bash
# Set SELinux in permissive mode (effectively disabling it)
setenforce 0
sed -i 's/^SELINUX=enforcing$/SELINUX=permissive/' /etc/selinux/config

yum install -y kubelet kubeadm kubectl --disableexcludes=kubernetes

systemctl enable kubelet
centos7用户还需要设置路由：
cat <<EOF >  /etc/sysctl.d/k8s.conf
net.bridge.bridge-nf-call-ip6tables = 1
net.bridge.bridge-nf-call-iptables = 1
EOF
sysctl --system
```

```
kubectl version --client

kubeadm init 启动一个 Kubernetes 主节点
kubeadm join 启动一个 Kubernetes 工作节点并且将其加入到集群
kubeadm upgrade 更新一个 Kubernetes 集群到新版本
kubeadm config 如果使用 v1.7.x 或者更低版本的 kubeadm 初始化集群，您需要对集群做一些配置以便使用 kubeadm upgrade 命令
kubeadm token 管理 kubeadm join 使用的令牌
kubeadm reset 还原 kubeadm init 或者 kubeadm join 对主机所做的任何更改
```

### 安装minikube，不能使用root权限
```
useradd testuser
usermod -aG docker testuser
su - testuser
minikube start --driver=docker
```

error: unable to forward port because pod is not running. Current status=Pending

### K8S组件有哪些？

部署一个k8s就直接得到一个集群，nodes：每个工作的机器成为一个Node，
Pods：The worker node(s) host the Pods that are the components of the application workload.
nodes上部署的
The control plane manages the worker nodes and the Pods in the cluster.
The control plane's components make global decisions about the cluster (for example, scheduling), as well as detecting and responding to cluster events
