---
layout: post
title: maven在pom文件里引用本地jar
category: 技术
tags: java tool
keywords: 
description: 
---




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

