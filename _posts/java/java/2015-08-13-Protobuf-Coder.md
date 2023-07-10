---
layout: page

title: protobuf编解码处理
category: trash
categoryStr: 分布式
tags: 
keywords: 
description: 
---

整个日志系统采用的socket来通信，所以socket来处理protobuf协议的话，需要从socket中获取输入流，然后从流中读取字节数组，然后将字节数组解析成protobuf对象。

我最先是错误的先从socket中读取一个字符串，然后将这个字符串解析成protobuf对象。后来发现乱码，而且解决不了，因为是编码的问题，但是不是。然后研究了下，最后采用先读出二进制数组，然后直接解析成protobuf对象。

```

InputStream input = socket.getInputStream();
String msgStr = readStrFromStream（input）;
CommonLog commonLog = CommonLog.parseFrom(msgStr.getBytes());//这种不行，各种乱码

```

使用字节数组

```

byte[] byteArr = readBytesFromStream（input）;
CommonLog commonLog2= CommonLog.parseFrom(byteArr );//这种可以，无论是socket还是文本

```

下面是readBytesFromStream方法：

```

public static byte[] readBytesFromStream(InputStream in) throws IOException {
byte len[] = new byte[1024];// 1024的缓冲刘
int tempCount = 0;
int count = 0;
try {
count = (tempCount = in.read(len)) > 0 ? tempCount : 0;

} catch (IOException e) {
// 捕获这个异常却不做任何处理是因为客户端发送过来available，send(0xFF)这种指令的时候就不去管它
e.printStackTrace();
throw new IOException(e);
}
byte[] temp = new byte[count];

for (int i = 0; i < count; i++) {

temp[i] = len[i];
}

return temp;

}

```

因为php是socket短连接（本来之前是HTTP请求的），所以使用NIO要好些（BIO适用于socket长连接，NIO适用于短连接），但是手动编写NIO处理socket连接的时候发现从中读到很多个零。后来知道是自己代码写的有问题。

```

public void channelRead(ChannelHandlerContext ctx, Object msg)
throws Exception {
System.out.println("nettyLogHandler读到的消息"+msg.toString());
// 重要的方法，用于从socketChannel里面读取消息，并返回结果
ByteBuf buf = (ByteBuf) msg;
int msgSize = buf.readableBytes();
byte[] req = new byte[msgSize];
buf.readBytes(req);
                CommonLog commonLog = CommonLog.parseFrom(req);
}

```

而且这个后面发现发送的日志如果过长的话，或者某个字段的长度过长还是会出现问题，必须发送方进行base64编码。
测试的过程中，发现手写的protobuf处理是各种问题，而且非常的不稳定，所以决定采用Netty的protobuf模块来处理protobuf协议的解析


其实就是在Netty的类似Filter的处理机制中添加2个编解码的过滤类。
Netty为protobuf提供了两个编码器（ProtobufEncoder，ProtobufVarint32LengthFieldPrepender），两个解码器（ProtobufVarint32FrameDecoder，ProtobufDecoder）
具体代码如下

```

protected void initChannel(SocketChannel ch) throws Exception {

ChannelPipeline p = ch.pipeline();
// 解码
p.addLast("frameDecoder", new ProtobufVarint32FrameDecoder());
// 构造函数传递要解码成的类型
p.addLast("protobufDecoder", new ProtobufDecoder(
CommonLogProbuf.CommonLog.getDefaultInstance()));
// 编码
p.addLast("frameEncoder", new ProtobufVarint32LengthFieldPrepender());
p.addLast("protobufEncoder", new ProtobufEncoder());

// 业务逻辑处理
p.addLast("handler", new ProtobufNettyServerHandler());
}

```

至此Protobuf使用了稳定性更强的Netty中的组件。





