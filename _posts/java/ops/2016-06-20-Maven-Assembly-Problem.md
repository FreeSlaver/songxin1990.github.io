---
layout: page

title: Maven assembly打包报错
category: ops
categoryStr: 运维监控
tags: projectbuild
keywords: 
description: 
---


我们都知道通过Maven assembly插件可以将项目打成指定的压缩包，比如.tar.gz，并且包含各种配置文件，启动脚本，依赖jar包，

最重要的是对不同的运行环境设置不同的配置文件夹，分别打包，这样就不需要每次打包时修改配置，十分方便。

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

然后仔细看了下，这个.tar.gz文件，里面只有一个lib文件夹，文件内容是项目本身的jar包，其他的配置文件，启动脚本，依赖jar包都没看到。

但是这个地方成功打包通过，说明刚才的问题是没有指定一个输出目录。

然后我之前在pom文件中定义的${deploy.dir}是没值的，这样的话，将bin,conf,lib等目录压缩到一个文件里面就不能成功。

然后我将${deploy.dir}直接改成target/dest。然后再次打包，成功，最终的压缩文件包含了bin,conf,lib目录。说明问题在于：

1.最终的tar.gz压缩包找不到要压缩的文件目录(bin,conf,lib)。

2.最终压缩文件的输出的目录没配置，之前pom中配置的文件名属性finalName,因为找不到bin,conf,lib等目录 没有起到效果。


