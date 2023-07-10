---
layout: page

title: Shadowsocks最简最快安装步骤
category: webmaster
categoryStr: 网站建设
tags: [shadowsocks,安装]
keywords: shadowsocks,安装
description: Shadowsocks最简最快安装步骤
---
# Shadowsocks最简最快安装步骤<a id="sec-1" name="sec-1"></a>
以centos 6.8为例：
```
  yum install epel-release
  yum update
  yum install   python-setuptools m2crypto wget
  wget https://pypi.python.org/packages/source/p/pip/pip-1.3.1.tar.gz --no-check-certificate
  tar -xzvf pip-1.3.1.tar.gz
  cd pip-1.3.1
  python setup.py install
  easy_install pip
  pip install shadowsocks
```
## 启动shadowsocks<a id="sec-1-1" name="sec-1-1"></a>
```
sudo ssserver -p 端口号 -k 密码 -m rc4-md5  -d start
```