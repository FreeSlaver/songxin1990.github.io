---
layout: page
breadcrumb: true
title: sbt总结
category: trash
categoryStr: 废弃
tags: sbt
keywords: 
description: 
---

**废弃，价值太小**

### sbt下载非常慢 ###

解决办法：在`~/.sbt/`文件夹下添加一个`repositories`文件，添加一下内容

```

[repositories]
  local
  aliyun: http://maven.aliyun.com/nexus/content/groups/public/
  sbt-releases-repo: http://repo.typesafe.com/typesafe/ivy-releases/, [organization]/[module]/(scala_[scalaVersion]/)(sbt_[sbtVersion]/)[revision]/[type]s/[artifact](-[classifier]).[ext]
  sbt-plugins-repo: http://repo.scala-sbt.org/scalasbt/sbt-plugin-releases/, [organization]/[module]/(scala_[scalaVersion]/)(sbt_[sbtVersion]/)[revision]/[type]s/[artifact](-[classifier]).[ext]
  central: http://repo1.maven.org/maven2/
  ivy:  http://repo.typesafe.com/typesafe/ivy-releases
  mvnrepository: https://mvnrepository.com/artifact/

```
