---
permalink: /baiduindex.html
layout: page

title: Github Pages百度索引收录工具
category: webmaster
categoryStr: 网站建设
tags: [github pages,baidu]
keywords: github pages,百度收录
description: 
---
<script type="text/javascript">
    // Javascript URL redirection
    //window.location.replace("http://data.3gods.com/baiduindex.html");
</script>
### 第一步 添加DNS解析 
去DNSPOD添加一条A记录，线路类型为百度的，将记录值设置为198.74.48.82。  
<img src="/img/life/2018-06-20-Github-Pages-Baidu-Index-Tool-1.png" class="post-img" alt="Github-Pages-Baidu-Index-DNS"/>
<hr>

### 第二步 填写Github Pages Url和域名  
 <form id="baiduIndexAdd" action="https://3gods.com/index/add" method="get">
   <!--<form action="http://localhost:4567/index/add" method="get">-->
    <div class="form-group">
        <label for="gitPagesUrl">Github Pages访问地址</label>
        <input type="url" name="gitPagesUrl" class="form-control" id="gitPagesUrl" placeholder="">
    </div>
    <div class="form-group">
        <label for="domainName">要绑定的域名</label>
        <input type="text" name="domainName" class="form-control" id="domainName" placeholder="">
    </div>
    <div class="form-group">
        <label for="email">你的邮箱</label>
        <input type="email" name="email" class="form-control" id="email" placeholder="">
    </div>
    <button type="submit" class="btn btn-default">提交</button>
</form>
<br>


### 第三步 去百度站长管理后台验证域名所有权   
<img src="/img/life/2018-06-20-Github-Pages-Baidu-Index-Tool-2.png" class="post-img" alt="Github-Pages-Baidu-Index-Add-Domain"/>

### 第四步 使用百度抓取诊断进行爬取校验  
<img src="/img/life/2018-06-20-Github-Pages-Baidu-Index-Tool-3.png" class="post-img" alt="Github-Pages-Baidu-Index-Verify"/>

如图显示，网站可被百度爬虫访问并成功抓取，后续百度就会进行收录工作，新站可能比较慢，但是可以手动提交sitemap.xml。  
<hr>

### 小结
目前很多功能都没考虑，支持的是最简单的情况，如果有人使用，或者有问题，可以在下方留言。