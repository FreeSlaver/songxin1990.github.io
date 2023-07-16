---
layout: page
title:  wordpress安全防护相关问题
category: wordpress
tags:
keywords:
description:
published:  true
---


也是不要先去Google，而是自己思考一下，虽然对网络安全，Web安全这块完全没什么概念。


安全漏洞

让WordPress保持最新版
对于大版本更新，你需要手动启动更新。
记住，没有什么是100%安全的，如果连政府的网站都能被攻破，又何况是你的呢？
备份可以让你在遇到突然状况时快速回复你的网站，你需要知道的最重要的事情是你必须定期将全站备份保存到一个远程位置（而不是你网站所在的主机）。
备份这个枯燥的工作可以使用VaultPress或者BackupBuddy
过最好的免费WordPress安全插件Sucuri Scanner来完成

启用网络应用防火墙 (WAF)
保护网站并对WordPress安全性充满信心的最简单方法是使用网络应用防火墙（WAF）
修改默认的用户名“admin”
禁用文件编辑也即代码编辑器
在wp-config.php文件中添加
// Disallow file edit
define('DISALLOW_FILE_EDIT', true );

对特定的WordPress目录禁用PHP文件执行
另一个可以加强WordPress安全性的方法是对那些不必要的目录（例如：/wp-content/uploads/）禁用PHP文件执行。
.htaccess中添加
<Files *.php>
deny from all
</Files>

### 限制登录尝试
安装并启用Login LockDown插件。


修改WordPress数据表前缀

禁用WordPress的XML-RPC

自动注销空闲用户

为WordPress登录添加安全问题
## Wordpress漏洞
### 后门
后门通常被加密以看起来像合法的WordPress系统文件，并通过利用平台过时版本中的弱点和错误进入WordPress数据库。  
您可以使用SiteCheck等工具扫描您的WordPress网站

### Pharma Hack
Pharma Hack漏洞用于在过时版本的WordPress网站和插件中插入恶意代码，导致搜索引擎在搜索受感染网站时返回药品广告。  
该漏洞更像是垃圾邮件威胁，

### Brute-force Login Attempts（暴力登录尝试）
蛮力登录尝试使用自动化脚本来利用弱密码并获得对您网站的访问权限。两步验证、限制登录尝试、监控未经授权的登录、阻止IP和使用强密码是防止暴力攻击的一些最简单和高效的方法。

### Malicious Redirects（恶意重定向）
恶意重定向使用FTP、SFTP、wp-admin和其他协议在WordPress安装中创建后门，并将重定向代码注入网站。
### 跨站脚本 (XSS)
