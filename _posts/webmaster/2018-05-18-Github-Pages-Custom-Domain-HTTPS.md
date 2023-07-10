---
layout: page

title: 给Github Pages自定义域名添加HTTPS
category: webmaster
categoryStr: 网站建设
tags: [https,github-pages]
keywords: github pages,域名,https
description: 
---

在5月份之前，Github Pages自定义域名是不支持HTTPS的，只能给*.githu.io的二级域名添加。  
有些人通过cloudfare来达到半路程的HTTPS化，配置比较麻烦，而且DNS解析也要给到cloudfare上，搞不好被国内给墙了。    

2018年5月1日之后，Github可以直接支持自定义域名的HTTPS，在项目的setting->Github Pages中设置。  
<img src="/img/life/2018-05-18-Github-Pages-Custom-Domain-HTTPS.png" class="post-img" alt="2018-05-18-Github-Pages-Custom-Domain-HTTPS">  

但是之前已经添加了域名的，方框不能勾选，而且会提示：   
Enforce HTTPS — Not yet available for your site because the certificate has not finished being issued  

解决办法就是：首先删除掉自定义域名，点击Save，然后等上几分钟，再次添加自定义域名，勾选Enforce HTTPS。  
这样就可以了。参考的:[How to enable https support on custom domains](https://github.community/t5/Pages/How-to-enable-https-support-on-custom-domains/td-p/6894/page/2)
