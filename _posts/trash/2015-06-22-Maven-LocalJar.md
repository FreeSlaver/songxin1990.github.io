---
layout: page
breadcrumb: true
title: maven在pom文件里引用本地jar
category: trash
categoryStr: 废弃
tags: 
keywords: 
description: 
---

<span style="color:red">**废弃**</span><br/>
原因：
这点知识记下来就好，再者，应该是可以模拟，还是用什么工具将jar装到本地，在maven中一样用。

maven在pom文件里引用本地jar，必须注意的一点就是此本地jar要放在本地maven配置的目录。
方法1：

```

<dependency> 
        <groupId>org.wltea</groupId> 
        <artifactId>IKAnalyzer</artifactId> 
        <version>2012_u6</version> 
        <scope>system</scope> 
        <systemPath>E:/repositories/IKAnalyzer2012_u6.jar</systemPath> 
</dependency>

```

方法2：

```

<dependency>
	<groupId>org.wltea</groupId>
	<artifactId>IKAnalyzer</artifactId>
	<version>3.2.8</version>
	<scope>system</scope>
	<systemPath>${basedir}/mylib/IKAnalyzer-3.2.8.jar</systemPath>
</dependency>

```

