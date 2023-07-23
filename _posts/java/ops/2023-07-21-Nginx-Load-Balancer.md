---
layout: page
title: 怎么使用Nginx实现负载均衡
category: ops
tags: [nginx,load-balancer]
keywords:
description:
---

Nginx只能实现HTTP层面的负载均衡吗？？   
老子是真的苦。 


## Supported Load Balanceing methods
1. round-robin 轮询
就是一个个排队，分别按照顺序挂靠到几个实例上
2. least-connected 最少连接数
最少连接数，这个应该是和连接挂钩的，所以应该是连接本身是一个非常重非常耗资源的操作，   
一般是物联网之类的长连接，或者是某些请求需要长时间才能完成。
3. ip-hash 对ip进行hash取模
和ip挂钩，也就是同一ip的请求必定会转发到固定的实例上。
## Default configuration
```vim
http {
    upstream myapp1 {
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://myapp1;
        }
    }
}
```
```java pseudocode round-robin
int i = 0;
int size = 3;//max serverInstance num
while(true){
    
    HttpRequest req = accept().get();
    List<ServerInstance> list;
    list.get(i).process(req);
    if(++i==size){
        i=0;
        }
}

```
反向代理支持负载均衡的有：http，https，FastCGI，uwsgi，SCGI， memcached，gRPG。 
分别使用http，https，fastcgi_pass, uwsgi_pass, scgi_pass, memcached_pass, 和 grpc_pass，  
也就是以fastcgi为例，使用fastcgi_pass
```vim
fastcgi_pass {
    upstream myapp1 {
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }

    server {
        listen 80;

        location / {
            proxy_pass http://myapp1;
        }
    }
}
```

## Nginx这个方向代理是怎么实现的？
监听80端口，然后对80端口的所有访问，代理转发到http://myapp1，然后会配置一个myapp1.conf的文件，  
然后这个myapp1.conf这个里面会配置对应的文件路径，比如/var/www/html/，或者socks，比如php-fpm.socks，  
其实理解上来说就是：一切都是文件，socks句柄进程也是个文件。然后就都是读写数据流，

## least connected
最少连接数：配置中添加least_conn。
```vim
upstream myapp1 {
        least_conn;
        server srv1.example.com;
        server srv2.example.com;
        server srv3.example.com;
    }

```
实现伪代码
```java pseudocode least connected
//怎么弄？对，你还要考虑有的连接释放，要减1，或者大批量掉线的
Map<String,ServerInstance> map= new TreeMap();//String is identifier or serverName
map.comparator(serverInstance.connectionNum);

map.sort();//有个问题，这个每次都要重新排序，太费了，必读这么搞，比如大批量掉线。
ServerInstance si = map.get(0);
si.setConnectinNum(si.getConnectionNum+1);
map.put(si.getServerName(),si);

si.process(httpRequest);
//大批量掉线。
ServerInstance si = map.get(serverName);
si.setConnectionNum(si.getConnectionNum-batchOfflineNum);
map.put(serverName,si);
```

## Session persistence
Session持久化，保存，黏性，就是比如用户A刚开始请求过来连接是srv1，之后突然断网掉线，但马上又连接过来，连到srv2，  
这种情况下session会话如何保存，传递？

使用round-robin，least-connected这两种是无法保证的，客户端任一个请求都会发送到不同服务器，可以使用ip-hash，  
但是客户也可能是浮动ip啊，不过短期ip是很难改的。  

其实这个ip，或者**session黏性实现的方式有很多，可以直接把服务实例和用户信息绑定在一起，存在Redis。**  

## Weight load balancing
权重负载均衡，
```vim
upstream myapp1 {
    server srv1.example.com weight=3;
    server srv2.example.com;
    server srv3.example.com;
}
```


应该是默认权重是1，第一个实例指定权重是3，假设5个请求过来了，3个会分配到srv1，另外2个会分配到srv2和srv3上，  
你想想这地方具体是怎么分的？1.第一到第三个请求先分到srv1，剩下的在分到srv2，srv3？
2.设置成百分比，或者数字10，然后摇塞子，落到数字1到6的分到srv1，数字7,8的srv2，数字9，10的srv3？  
3.还是分别一个分1个，然后再来的分到srv1，srv1？如果有亿万个请求了？

```java pseudocode Weight 
//按照这个描述的要求就是5个请求来了，3个会先分配到srv1，另外一人一个就行了，只要满足这个就行，那也很简单
//直接计算出重的权重，然后取模就行了。



```





