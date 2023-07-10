---
layout: page

title: Windows上Mysql 8.0 的安装
category: mysql
categoryStr: MySQL
tags: 
keywords: 
description: 
---

  官方下载的最新的8.0的绿色社区版，本以为直接到bin目录下执行个mysqld.exe就行了，发现执行后，毛都没有，连个提示信息都没，懵逼。  
  Google之，发现需要建立data目录，和bin同级的，然后手动建立之，没卵用，报错：  
  Failed to find valid data directory.  
  草，再Google之，看到Stack Overflow的一个答案：  
  手动删除data目录，运行bin目录下的mysqld --initialize，记下随机生成的root密码。 
  再运行mysqld --console，ok，服务启动了。  

  然后用mysqlyog连接，又TM报错，卧槽，  
  Authentication plugin 'caching_sha2_password' cannot be loaded  
  真TM够了，之前装mysql，运行一个exe就行了，怎么现在这些软件设计的对傻瓜都不够友好，深深的感受到了一股恶意。  
  可能是因为我用的社区版，没交钱？？  

  继续Google之，查到可以运行 ALTER USER 'yourusername'@'localhost' IDENTIFIED WITH mysql_native_password BY 'youpassword';  
  OK，在cmd中，运行mysql -u root -p，输入刚记下的随机生成密码，先登陆进去。  
  在复制黏贴 ALTER USER 'yourusername'@'localhost' IDENTIFIED WITH mysql_native_password BY 'youpassword';  
  mysqlyog再次连接，Ok，成功。  

  真够费劲的。  
  妈的，本来以为搞完了，现在用spring boot java程序连接上，又报错：  
  The server time zone value '�й���׼ʱ��' is unrecognized or represents more than one time zone
  需要在连接mysql的配置文件的url上设置serverTimezone=UTC  
