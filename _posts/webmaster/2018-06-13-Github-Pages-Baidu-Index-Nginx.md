---
layout: page

title: Github Pages百度索引收录
category: webmaster
categoryStr: 网站建设
tags: [github pages,baidu]
keywords: github pages,百度收录
description: 
---
<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Github Pages百度索引收录</a>
<ul>
<li><a href="#sec-1-1">1.1. 现有的解决方案</a>
<ul>
<li><a href="#sec-1-1-1">1.1.1. 第一种方案 使用coding.net建立镜像网站</a></li>
<li><a href="#sec-1-1-2">1.1.2. 第二种方案 使用共享虚拟主机</a></li>
<li><a href="#sec-1-1-3">1.1.3. 第三种方案：使用VPS做镜像站点</a></li>
<li><a href="#sec-1-1-4">1.1.4. 第四钟方案：利用CDN</a></li>
</ul>
</li>
<li><a href="#sec-1-2">1.2. 使用Nginx反向代理百度爬虫</a></li>
</ul>
</li>
</ul>
</div>
</div>

# Github Pages百度索引收录<a id="sec-1" name="sec-1"></a>

现在很多人用Github Pages来写博客，优点很多，但是缺点也有，其中一个就是：无法被百度收录。  
Github会对百度爬虫的访问直接返回403 Forbidden。  

## 现有的解决方案<a id="sec-1-1" name="sec-1-1"></a>

有现有的解决方案，但是都太繁琐。下面我会大概说说繁琐和缺点在哪里，具体如何做，请自行Google。  

### 第一种方案 使用coding.net建立镜像网站<a id="sec-1-1-1" name="sec-1-1-1"></a>

然后在DNS解析中添加一条解析记录，将线路类型为百度搜索引擎的指向到coding的pages主页。  

缺点是：  
作为免费的银牌用户，必须要在主页加上Host by Coding的logo或文字，而且还要通过审核，  
如果审核没通过或以后撤销，页面就会先进行跳转，但是百度还是能抓取到，但是结果就是，只会有一条记录，  
用site:域名查看一下，显示的就是：  
跳转中-xxx的网站  

**真TM恶心。**
而且coding还没有301跳转，每次都必须维护2个仓库。  

### 第二种方案 使用共享虚拟主机<a id="sec-1-1-2" name="sec-1-1-2"></a>

以阿里云共享虚拟主机为例，生成的静态html文件（jekyll的_site目录下）直接拖到主机根目录下，  
然后在DNS也是添加一条线路类型为百度的单独解析到阿里云共享主机的临时域名上。  

但是不可能每次写了篇文章就要手动拖放一遍吧，太麻烦了。  
而且阿里云共享虚拟主机是最便宜的，一年也得50块。而且不支持301，不支持无后缀的url，也就是必须要带.html,.htm之类的。  
而且一个ip被多个域名共用，对百度收录，SEO会有一定影响。但是优点是：国内访问很快。  

### 第三种方案：使用VPS做镜像站点<a id="sec-1-1-3" name="sec-1-1-3"></a>

也就是在自己的VPS上git clone一份github repo，然后用jekyll开启镜像站点，  
再去DNS上添加一条百度的单独解析到此VPS的外网ip，然后用Nginx反向代理到jekyll服务所在的端口。  
启动定时任务去git上定时拉取最新的提交，保证百度爬虫能够收录到最新的文章。  

这个的最大缺点是需要自己的VPS，一个月最少5刀，当然对于广大翻墙党这不是问题，  
但是还要部署jekyll服务，安装ruby依赖，还要搞nginx反向代理，起定时任务，太多东西要搞了。  
不过这也是学习的机会，可以尽情折腾，多多学习。  

### 第四钟方案：利用CDN<a id="sec-1-1-4" name="sec-1-1-4"></a>

这个没折腾过，不好说，但是理论上来说，百度爬虫过去抓取时，CDN上必须要已经有相应页面的缓存，否则，爬取就会失败。  

## 使用Nginx反向代理百度爬虫<a id="sec-1-2" name="sec-1-2"></a>

最近在学习Nginx，想到既然Nginx可以做反向代理，为嘛不能直接代理百度爬虫，  
去向github pages请求，然后将结果返回给百度爬虫，这样不就行了吗？  
百度爬取github给403的主要判断依据是user agent，那么在Nginx中将user agent替换掉，不就行了？  

**试了一下，果然可以。**  
具体的做法如下（我是centos 6.8）：  
首先在/etc/nginx/conf.d目录下，新建一个xxdomain.conf的文件，比如我的是3gods.com.conf。  
输入以下Nginx的配置内容：  
```bash
server{
      listen 80;
      #替换成自己的域名
      server_name 3gods.com; 
      location / {
          #替换成自己的github pages主页
          proxy_pass         https://songxin1990.github.io; 
          proxy_redirect     off;
          proxy_set_header   User-Agent "Mozilla/5.0";
          proxy_set_header   Host               $host;
          proxy_set_header   X-Real-IP          $remote_addr;
          proxy_set_header   X-Forwarded-For    $proxy_add_x_forwarded_for;
       }
 }
 
```

然后重载Nginx配置：  
service nginx reload  
然后去DNS中添加一条线路类型为百度的指向到VPS的ip就行了。  

目前VPS流量较多，需要帮百度索引收录Github Pages的，可以在下方留言，写上你的域名，github pages的url，个人邮箱。  
添加了一个小工具，想要用的直接访问[Github Pages百度索引收录工具](/baiduindex.html)自行操作吧。  