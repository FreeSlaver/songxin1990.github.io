---
layout: page
breadcrumb: true
title: Netty实现HTTP服务器
category: trash
categoryStr: 废弃
tags: Netty HTTP
keywords: 
description: 
---

Netty实现一个HTTP服务器是一件非常简单的事情。

### HttpServer.java

```

public class HttpServer extends Thread implements Closeable {

    private final int port ;
    final EventLoopGroup bossGroup = new NioEventLoopGroup();
    final EventLoopGroup workerGroup = new NioEventLoopGroup(10);
    final HttpRequestHandler handler;


    public HttpServer( int port, HttpRequestHandler handler) {
        super("SMS-httpserver" );
        this.port = port;
        this.handler = handler;
    }

    public void run() {
        try {
            ServerBootstrap b = new ServerBootstrap();
            b.option( ChannelOption.SO_BACKLOG, 1024);
            b.group( bossGroup, workerGroup )
                    .channel(NioServerSocketChannel.class)
                    .childHandler( new HttpServerInitializer(this ));

            Channel ch = b.bind(port).sync().channel();
            LogUtil. info(HttpServer .class , "SMS HttpServer start at port:" + port);
            ch.closeFuture().sync();
        } catch (InterruptedException ie) {
            Thread. currentThread().interrupt();
            throw new RuntimeException(ie.getMessage(), ie);
        } finally {
            bossGroup.shutdownGracefully();
            workerGroup.shutdownGracefully();
        }
        LogUtil. warn(HttpServer .class , "SMS HttpServer run over");
    }

    @Override
    public void close() throws IOException {
        LogUtil. info(HttpServer .class , "SMS HttpServer stop port:" + port);

        bossGroup.shutdownGracefully();
        workerGroup.shutdownGracefully();
    }

    public static void main(String[] args) throws Exception {
        // BasicConfigurator.configure();
        int port;
        if (args.length > 0) {
            port = Integer. parseInt(args[0]);
        } else {
            port = 9093;
        }
        System. out.println("start server" );
        new HttpServer(port, null).run();
        System. out.println("server stop" );
    }
}

```

### HttpServerHandler.java

```

public class HttpServerHandler extends
        SimpleChannelInboundHandler<FullHttpRequest > {

    private final BusinessHandle business = new BusinessHandle();
    private final StringBuilder buf = new StringBuilder();
    final HttpServer server;

    public HttpServerHandler(HttpServer server) {
        this.server = server;
    }

    @Override
    public void channelReadComplete(ChannelHandlerContext ctx) {
        ctx.flush();
    }

    @Override
    protected void channelRead0(ChannelHandlerContext ctx,
            final FullHttpRequest request) {
        Long beginTime = System. currentTimeMillis();
        // HTTP/1.1:
        // 实现http status为100的http报文处理
        if (HttpHeaders.is100ContinueExpected(request)) {
            send100Continue(ctx);
        }

        String httpBody = request.content().toString(Charset.defaultCharset());

        String httpUri = request.getUri();
        HttpMethod httpMethod = request.getMethod();
        HttpVersion httpVersion = request.getProtocolVersion();
        HttpHeaders httpHeaders = request.headers();
        List listA = httpHeaders.entries();

        LogUtil. debug(HttpServerHandler.class, "httpBody:" + httpBody
                + "httpUri:" + httpUri + "httpMethod:" + httpMethod
                + "httpHeaders:" + Arrays.toString(listA.toArray()));
        // 调用business处理,获得ResponseFrame
        ResponseFrame response = null;
        if (StringUtils.isEmpty(httpUri)) {
            response = new ResponseFrame(ApiExceptionError.INVALID_URL );
        } else if (StringUtils.isEmpty(httpBody)) {
            response = new ResponseFrame(
                    ApiExceptionError.INVALID_REQUEST_PARAMETERS );
        }

        response = business.process(httpUri, httpMethod, httpBody);
        if (null == response) {
            response = new ResponseFrame(
                    ApiExceptionError.INVALID_REQUEST_PARAMETERS );
        }
        String responseBody = JSON.toJSONString(response);
        // 回写http response
        // 可以对回写内容进行修改
        if (!writeResponse(ctx, request, responseBody)) {
            // HTTP/1.1:
            // 如果Connection设置为keep-alive，关闭链接并且将内容flush到对端
            ctx.writeAndFlush(Unpooled.EMPTY_BUFFER).addListener(
                    ChannelFutureListener.CLOSE);
        }
        // JMX计数，以及响应时间
        Metric.addMetric(System.currentTimeMillis () - beginTime);
    }

    /**
     * 实现简单的本项目专用HTTP/1.1规范
     *
     * @param ctx
     *            通道的上下文内容 {@link ChannelHandlerContext}对象
     * @param request
     *            response所需部分request包头参数
     * @param content
     *            response回写内容，即 http content
     *
     *            返回 keepalive标记，{@code true}为 keepalive
     */
    private boolean writeResponse(ChannelHandlerContext ctx,
            FullHttpRequest request, String content) {
        // Build the response object.
        FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1,
                request.getDecoderResult().isSuccess() ? OK : BAD_REQUEST ,
                Unpooled.copiedBuffer(content, CharsetUtil.UTF_8));

        response.headers().set( CONTENT_TYPE, "application/json; charset=UTF-8" );

        // HTTP/1.1:
        // 接收到keepalive标记，response返回keepalive标记
        boolean keepAlive = HttpHeaders.isKeepAlive(request);
        if (keepAlive) {
            // HTTP/1.1:
            // 'Content-Length'头信息仅用于keep-alive链接
            response.headers().set( CONTENT_LENGTH,
                    response.content().readableBytes());
            // HTTP/1.1:
            // 'Connection'头信息设置keep-alive
            // -
            // http://www.w3.org/Protocols/HTTP/1.1/draft-ietf-http-v11-spec-01.html#Connection
            response.headers().set( CONNECTION, HttpHeaders.Values.KEEP_ALIVE);
        }

        // HTTP/1.1:
        // cookie非空情况下处理Cookie
        String cookieString = request.headers().get(COOKIE);
        if (cookieString != null) {
            Set< Cookie> cookies = CookieDecoder.decode(cookieString);
            if (!cookies.isEmpty()) {
                // HTTP/1.1:
                // 重发已携带的cookie
                for (Cookie cookie : cookies) {
                    response.headers().add( SET_COOKIE,
                            ServerCookieEncoder.encode(cookie));
                }
            }
        }

        // 发送http response
        ctx.write(response);

        return keepAlive;
    }

    private static void send100Continue(ChannelHandlerContext ctx) {
        // FullHttpResponse response = new DefaultFullHttpResponse(HTTP_1_1,
        // CONTINUE);
        ctx.write( new DefaultFullHttpResponse( HTTP_1_1, CONTINUE));
    }

    @Override
    public void exceptionCaught(ChannelHandlerContext ctx, Throwable cause) {
//        cause.printStackTrace();
        Metric.addErrMetric();
        LogUtil.error(HttpServerHandler.class, "HttpServerHandler捕捉到异常：" +cause.getMessage());
        ctx.close();
    }
}

```


### HttpServerInitializer.java

```
public class HttpServerInitializer extends ChannelInitializer<SocketChannel> {
    final HttpServer server;

    public HttpServerInitializer(HttpServer server) {
        this.server = server;
    }

    @Override
    public void initChannel(SocketChannel ch) throws Exception {
        ChannelPipeline p = ch.pipeline();
        // 旧代码
//        p.addLast(new HttpRequestDecoder());
        // p.addLast(new HttpObjectAggregator(1048576));
//        p.addLast(new HttpResponseEncoder());
        // p.addLast(new HttpContentCompressor());
//         p.addLast(new HttpServerHandler(server));
        p.addLast("servercodec", new HttpRequestDecoder());
        p.addLast("responseencoder",new HttpResponseEncoder());
        // 为http request解析准备最大4MB缓存，似乎可以更大点
        // 小一些可以更安全的防护flood攻击
        p.addLast("aggegator",new HttpObjectAggregator(1024 * 1024 * 4));
        p.addLast("handle", new HttpServerHandler(server));
    }
}

```


### HttpRequestHandler.java

```
public class HttpRequestHandler {

  public HttpRequestHandler() {
  }

  public void handle(Map<String, String> args, byte[] data) {
// System.out.println("handler http request");
  // produce()
  }

  private void produce() {
  // handleProducerRequest()
  }

  protected void handleProducerRequest() {

  }
}

```