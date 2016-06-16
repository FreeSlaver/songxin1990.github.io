---
layout: post
title: 今天调试遇到类型转换的坑
category: 技术
tags: 
keywords: 
description: 
---


今天在调试的时候报了空指针异常，原来是Long = null转换成long时候报的。

在debug调试之前出现的一个问题，就是Eclipse提示“Unable to install breakpoint due to missing line number attributes,Modify compiler options to generate line number attributes“。

这是因为项目的编译JDK版本和Eclipse的不一致，需要在项目上右键-properties-Java-Compiler中，在compiler起始页，classfile Generation区域中确认已经勾选了All line number attributes to generated class files。

首先我定义了一个参数Long takeUid = null;

然后在ParcelService类中定义方法 ParcelVo makeParcel(long takeUid)，然后在ParcelServiceImpl中实现该方法。

这样在我注解的时候，使用parcelService.makeParcel(takeUid )，的时候就爆出了空指针异常，而且根本不会进到ParcelServiceImpl的实现方法中。

原来是Long到long之前报了空指针，而这些都在参数里面，十分隐蔽。然后查了下java如何实现Long到long转换的。

 从JDK1.5之后java引入了自动装箱与自动拆箱技术。一般我们产生一个对象都是通过new的形式，而包装类都是自动的。

#### 装箱机制：

Long t1 = 1000L;

Long t1 = Long.valueOf(1000L);

####拆箱机制：

long t2 = t1;

拆箱底层编译期实现：

long t2 = t1.longValue();

以上就是包装类型的拆箱以及装箱的原理。


