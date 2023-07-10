---
layout: page

title: 日志队列系统二 关于protobuf
category: trash
categoryStr: 分布式
tags: 
keywords: 
description: 
---



关于protobuf的介绍指南，见这里：

简介：http://blog.csdn.net/hguisu/article/details/20721109

指南：http://www.cnblogs.com/dkblog/archive/2012/03/27/2419010.html


java整合protobuf，见这里：http://blog.csdn.net/lufeng20/article/details/8736584

protobuf自定义扩展，见这里：http://blog.csdn.net/lufeng20/article/details/18276557

在这里我只想说说使用protobuf过程中需要注意的问题，以及一些遇到的异常如何处理。

1.尽量将protobuf实例解析成二进制，然后进行相应的序列化，反序列化等操作。

2.将protobuf对象持久化到文本文件并将它从文本文件中解析出来，我测试了很多种，只有二种方案可行。

将对象全部以二进制数组的形式保存到文件中，然后反序列化出来。

使用protobuf自带的方法。

读出：

```
FileInputStream input = new FileInputStream(new File(path));

while ((commonLog = CommonLog.parseDelimitedFrom(inputStream)) != null) {
	msgList.add(commonLog);
	count++;
}

```

写入：

```

FileOutputStream out = new FileOutputStream(new File(path),true);

for(CommonLog commonLog :list){
     commonLog .writeDelimitedTo(out);
}

```

后面finally中close掉相关资源。

这里列举几种我测试的小例子

```

 CommonLog.parseFrom( byte[])//可以
 CommonLog.parseFrom( byteString)//可以
 CommonLog.parseFrom( inputStream)//不行
 CommonLog.parseDelimitedFrom( inputStream)//可以
 CommonLog.parseFrom( data, extensionRegistry)//带extensionRegistry参数的都没测试

```

使用protobuf自带的方法进行序列化和反序列的速度非常的快，比java自身的对象序列化和反序列化技术要快很多。完全不是一个量级的，有兴趣的可以自己测试下。
这里放张图比较下

```

      序列化时间  反序列化时间	大小	压缩后大小
java序列化	8654	43787	889	541
hessian	6725	10460	501	313
protobuf	2964	1745	239	149
thrift	3177	1949	349	197
avro	3520	1948	221	133
json-lib	45788	149741	485	263
jackson	3052	4161	503	271
fastjson	2595	1472	468	251

```

3.使用NIO从socket中读到的byte数组需要去掉多余的0。



异常：

```
While parsing a protocol message, the input ended unexpectedly in the middle of a field.  
This could mean either than the input has been truncated or that an embedded message misreported its own length
```

这个异常是字段的值过长，这种需要将得到的全部解析成字节数组，然后解析出来，实在不行，就一个个属性的解析出来。
在实际的使用中还会遇到其他的很多异常和坑，网上的资源都较少，后续我想到了，在补充吧。
不过抓住2点，使用它自带的方法或者都变成byte数组之后再操作会简单很多。

用到的代码我也贴在下面

```

public static List<CommonLog> readLogsFromFile(File file)throws IOException {
	if(file==null||file.length()==0){
		file.delete();
		return null;
	}
List<CommonLog> msgList = new ArrayList<CommonLog>(1024);
FileInputStream inputStream = null;
try {
	inputStream = new FileInputStream(file);
} catch (FileNotFoundException e) {
	LOG.error("文件不存在" + file.getAbsolutePath());
	throw new FileNotFoundException("文件不存在" + file.getAbsolutePath()
	+ e.getMessage());
}

int count = 0;
try {
	CommonLog commonLog = null;
	// while ((commonLog = CommonLog.parseFrom(inputStream)) != null) {
	// 只能使用这个parseDelimitedFrom写入和读出来
	while ((commonLog = CommonLog.parseDelimitedFrom(inputStream)) != null) {
		msgList.add(commonLog);
		count++;
	}
} catch (IOException e) {
	LOG.error("FileUtils调用convertFile2Msg，读取文件"
	+ file.getAbsolutePath() + "出错!!!");
	throw new IOException(e);
} finally {
	try {
		if (null != inputStream) {
		inputStream.close();
	}
	} catch (IOException e) {
		LOG.error("FileUtils调用convertFile2Msg，关闭br出错!!!");
		throw new IOException(e);
	}
}
	return msgList;
}

```


//读出，写入


