---
layout: page

title: Dubbo动态获取接口实现
category: distribute
categoryStr: 分布式
tags: [dubbo,opensource]
keywords: dubbo,动态
description: 如何动态的从Dubbo中获取指定接口的，不同业务系统的实现实例，并进行调用。
---
<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Dubbo动态获取接口实现</a>
<ul>
<li><a href="#sec-1-1">1.1. 业务场景</a></li>
<li><a href="#sec-1-2">1.2. 具体实现</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. 要注意的问题</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. 为什么不应该用Dubbo实现</a></li>
</ul>
</li>
</ul>
</div>
</div>

# Dubbo动态获取接口实现<a id="sec-1" name="sec-1"></a>

## 业务场景<a id="sec-1-1" name="sec-1-1"></a>

首先提出问题，我们遇到的业务需求场景是这样的：  
业务系统调用消息系统发送短信，短信运营商回调通知短信发送结果，消息系统需要将这个短信实际最终发送结果告知给业务系统。  

实现方案是：使用Dubbo。消息系统这边定义Dubbo服务接口，业务系统来实现接口，也就是收到回调通知后具体干什么。  
Dubbo服务实现由消息系统来调用，通过分配不同的group来区分业务系统。  

这里的问题就是：如何动态的从Dubbo中获取指定接口的，不同业务系统的实现实例，并进行调用。  

## 具体实现<a id="sec-1-2" name="sec-1-2"></a>

Dubbo这块我也不太熟，网上搜到篇文章，还不错： [基于Dubbo的动态远程调用](https://blog.csdn.net/michaelzhaozero/article/details/44079655) 。  
这个方案是通过url来区分不同的Dubbo服务实例，但是会有个问题，需要将这个url和业务系统建立对应关系，并存取起来。  
这样的话，整个程序的通用性，可扩展性都会大打折扣，还有就是，假设后续这个url变了，怎么办？  

优化方案：  
通过group来区分不同的Dubbo服务实例，然后通过设置zookeeper注册中心，从注册中心获取的方式，会更加好些。  
贴段简单的代码：  
```java
public class RealReference {
    //用于将bean关系注入到当前的context中  
    @Autowired
    private ApplicationContext applicationContext;

    @Test
    public void realReference() {
        String url = "dubbo://localhost:22880/com.demo.service.DemoService";
        //通过url获取Dubbo服务Bean
        getServiceByUrl(url);
        //通过group获取Dubbo服务bean
//        getServiceByGroup("g2");
    }

    private void getServiceByGroup(String group) {
        RegistryConfig registry = new RegistryConfig();
        registry.setAddress("127.0.0.1:2181");
        registry.setProtocol("zookeeper");

        ReferenceBean<DemoService> referenceBean = new ReferenceBean<DemoService>();
        referenceBean.setApplicationContext(applicationContext);
        referenceBean.setInterface(com.demo.service.DemoService.class);
        referenceBean.setGroup(group);
        referenceBean.setRegistry(registry);

        try {
            referenceBean.afterPropertiesSet();
            DemoService demoService = referenceBean.get();
            System.out.print(demoService.deal("HAHAHA"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }


    private void getServiceByUrl(String url) {
        ReferenceBean<DemoService> referenceBean = new ReferenceBean<DemoService>();
        referenceBean.setApplicationContext(applicationContext);
        referenceBean.setInterface(com.demo.service.DemoService.class);
        referenceBean.setUrl(url);
//        referenceBean.setGroup("g1");

        try {
            referenceBean.afterPropertiesSet();
            DemoService demoService = referenceBean.get();
            System.out.print(demoService.deal("Tester"));
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}  

```

### 要注意的问题<a id="sec-1-2-1" name="sec-1-2-1"></a>

referenceBean.get()是一个非常重的操作，所以不要每次都通过get来获取，最好是能缓存起来，然后通过定时任务来无脑刷新。  
因为可能会遇到一种情况：就是Provider掉线，又上线，而这边的Bean还没刷新，调用的时候就会出错。  
（文章这个地方有问题，不能无脑刷新，这样的话会导致com.alibaba.dubbo.rpc.RpcException: Forbid consumer。  

还有就是实现类的接口路径，包名要保持一致。  
调试时还发现个问题，就是Provider注册的时候设置了group，那么通过url拿的时候也必须要设置group。  

复制黏贴的代码我也不改了，具体的代码，Demo项目都放到Gihub了，地址：  
[Dubbo动态获取接口实现](https://github.com/songxin1990/dubbo-dynamic-impl)  

## 为什么不应该用Dubbo实现<a id="sec-1-3" name="sec-1-3"></a>

首先，我个人是非常不赞同这里使用Dubbo来实现的。为什么了？  
首先是理解起来不容易，短信运营商那边通过HTTP回调通知给消息系统，消息系统也同样使用HTTP通知给业务系统就行了，业务系统只需添加相应的Controller。  
而且整个回调链路都是一致的，都是通过的HTTP，都是同向广播的。  
而如果使用Dubbo的话，短信运营商那边通过HTTP回调，消息系统这边先要拿到业务系统的Dubbo服务实现，然后来调用此服务。  

第二，实现起来，HTTP比Dubbo更简单，更通用，扩展性更好。  
而用Dubbo，需要在消息系统中维护整个接口的Dubbo服务列表等，需要告警，定时刷新服务实例等。 

第三，消息系统这边只需要做它该关心的东西，就是在接受到回调通知后，将此条短信的发送结果告知给业务方就行了。  
至于业务方是否要接受这个通知，如何处理这个通知，权限，逻辑控制都由业务方决定，实现。消息系统这边不用关心。  
如果用Dubbo的话，是否要通知业务方就要有消息系统来决定了。  
还有就是，如果在消息系统中调用业务方的Dubbo服务，很可能这个服务非常的重，导致消息系统性能瓶颈，负载过高等。  

第四：测试。使用HTTP实现的，测试人员只要收到通知业务系统的HTTP响应成功就行了，而使用Dubbo服务实现的，必须要业务方先提供相应的Provider，  
然后获取预期的输出，才能测试消息系统中的整个功能。  

第五：依赖关系，业务实现方必须要引入定义这个接口的Maven依赖，否则要在项目中自建相同包名的接口。  

至于说，使用Dubbo可以解决业务方HTTP服务的IP和域名的耦合问题，我觉得这个应该是属于运维该去处理的事情。  
什么情况下用Dubbo实现较好？  
业务方都应该也要实现相关的Dubbo接口服务，并且这个业务功能是否启用，是否要被调用由另外的系统来管控的时候。  

如果对以上有异议，欢迎留言或指正。  
