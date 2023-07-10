---
layout: page

title: Elasticsearch  Shield安装部署 JAVA连接
category: ops
categoryStr: 运维监控
tags: 
keywords: 
description: 
---


一：安装部署
1.安装shield插件

```

bin/plugin -i elasticsearch/license/latest

bin/plugin -i elasticsearch/shield/latest

```

2.启动Elasticsearch

```

bin/elasticsearch

```

3.添加admin用户
bin/shield/esusers useradd es_admin -r admin
然后输入密码，至少6个长度。这里创建的用户名是es_admin，密码我填的admin123

4.访问界面

```

curl -XGET 'http://localhost:9200/'
这个时候要求输入用户名和密码，我们填入es_admin，admin123
或者在命令行下输入
curl -u es_admin:admin123 -XGET 'http://localhost:9200/'

```

二：JAVA端通过shield验证连接(Transport方式)
1.添加jar包。

```
maven:

      <dependency>
         <groupId>org.elasticsearch</groupId>
         <artifactId>elasticsearch-shield</artifactId>
         <version>1.3.1</version>
      </dependency>
```

如果无效，可以去http://maven.elasticsearch.org/releases/org/elasticsearch/elasticsearch-shield/1.3.1/elasticsearch-shield-1.3.1.jar手动下载

2.需要在TransportClient中的setting属性添加一个键值对

```

Settings settings = ImmutableSettings.settingsBuilder()
                              .put("shield.user","shield_user_name:shield_user_pwd")
                              .put("cluster.name", clusterName).build();

```

"shield_user_name"是你配置的shield的用户名，默认是es_admin
"shield_user_pwd"是你配置的shield的密码，比如admin123.

你也可以添加一个授权在每个的请求头里面，如果你已经配置一个全局的验证证书，那个这个单独配置的授权请求头会他覆盖掉了全局的验证配置，这一点当许多用户使用同一个客户端接入Elasticsearch的时候非常有用。
具体代码如下：

```

TransportClient client = new TransportClient(ImmutableSettings.builder()
    .put("shield.user","shield_user_name:shield_user_pwd")
    ...
    .addTransportAddress(new InetSocketTransportAddress("localhost", 9300))
    .addTransportAddress(new InetSocketTransportAddress("localhost", 9301));

//在头部添加单独的验证
String token = basicAuthHeaderValue("test_user", new SecuredString("changeme".toCharArray()));

client.prepareSearch().putHeader("Authorization", token).get();

```

3.启用SSL协议
你需要配置客户端的keystor路径和密码。客户端验证需要每一个客户端都有签名过的证明

```
TransportClient client = new TransportClient(ImmutableSettings.builder()
     .put("cluster.name", "myClusterName")
    .put("shield.user","shield_user_name:shield_user_pwd")
    .put("shield.ssl.keystore.path", "/path/to/client.jks") (1)
    .put("shield.ssl.keystore.password", "password")
     //启用SSL传输协议
    .put("shield.transport.ssl", "true"))
    .addTransportAddress(new InetSocketTransportAddress("localhost", 9300))
    .addTransportAddress(new InetSocketTransportAddress("localhost", 9301));

```

具体参见
![具体参见](https://www.elastic.co/guide/en/shield/current/_using_elasticsearch_java_clients_with_shield.html#disabling-client-auth)

三：JAVA端通过shield验证连接(HTTP方式)




