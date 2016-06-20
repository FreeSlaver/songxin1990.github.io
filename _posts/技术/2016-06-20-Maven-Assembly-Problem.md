---
layout: post
title: Maven assembly打包报错
category: 技术
tags: Maven
keywords: 
description: 
---


我们都知道通过Maven assembly插件可以将项目达成jar包，并且包含各种配置文件，启动脚本，依赖jar包，

最重要的是可以不同的运行环境对应不同的配置打成不同的jar包，这样就不需要每次打包时修改配置了，十分方便。

但是今天我使用Maven assembly打包报错：

```

org.codehaus.plexus.component.repository.exception.ComponentLookupException: java.util.NoSuchElementException

Failed to create assembly: Error creating assembly archive bin: You must set at least one file.

```

在网上找了一堆资料，stackoverflow,apach maven jira等等都看了，还是没解决问题。然后在隔壁架构师的指导下，在assembly.xml中添加了

```

<dependencySets>
  <dependencySet>
    <useProjectArtifact>true</useProjectArtifact>
    <outputDirectory>lib</outputDirectory>
    <scope>runtime</scope>
  </dependencySet>
</dependencySets>

```

然后编译，通过了，激动。

然后仔细看了下，这个.tar.gz文件，里面只有一个lib文件夹，文件内容是项目本身的jar包，其他的配置，属性，依赖jar包都没看到。

但是这个地方成功打包通过，说明刚才的问题是在没有指定一个输出目录。

然后我之前的pom文件中定义的${deploy.dir}是没值的，这样的话，将bin,conf,lib等目录压缩到一个文件里面就不能成功。

然后我将${deploy.dir}直接改成target/des。然后再次打包，成功，说明问题在于：

1.最终的tar.gz压缩包找不到要压缩的文件目录。

2.输出的目录没配置，之前pom中配置的文件名finalName因为找不到bin,conf,lib等目录 没有起到效果。


