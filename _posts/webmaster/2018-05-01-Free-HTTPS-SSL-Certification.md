---
layout: page

title: 免费的HTTPS SSL证书
category: webmaster
categoryStr: 网站建设
tags: [https,ssl,微信,nginx]
keywords: 微信小程序,https,ssl
description: 
---
<div id="table-of-contents">
<li><a href="#sec-1-1">1.1. 安装下载必要组件</a>
<ul>
<li><a href="#sec-1-1-1">1.1.1. 1. 安装Nginx</a></li>
<li><a href="#sec-1-1-2">1.1.2. 2. 下载Let's Encrypt SSL</a></li>
<li><a href="#sec-1-1-3">1.1.3. 3. 为Ngnix生成免费的证书</a></li>
<li><a href="#sec-1-1-4">1.1.4. 4. 为Ngnix安装证书</a></li>
<li><a href="#sec-1-1-5">1.1.5. 5. 自动化重新生成证书：</a></li>
</ul>
</li>
<li><a href="#sec-1-2">1.2. 参考文章与扩展阅读</a></li>
</ul>
</li>
</ul>
</div>
</div>


微信小程序必须绑定支持HTTPS的域名，我们 [使用 Let's Encrypt](https://letsencrypt.org/) 来实现。  
本文机器是centos 6.8。  

## 安装下载必要组件<a id="sec-1-1" name="sec-1-1"></a>

### 1. 安装Nginx<a id="sec-1-1-1" name="sec-1-1-1"></a>
```bash
yum install epel-release
yum install nginx
```
### 2. 下载Let's Encrypt SSL<a id="sec-1-1-2" name="sec-1-1-2"></a>
```bash
yum install git
cd /opt
git clone https://github.com/letsencrypt/letsencrypt
```

### 3. 为Ngnix生成免费的证书<a id="sec-1-1-3" name="sec-1-1-3"></a>

用插件完成，必须保证80端口可用，所以务必停掉Nginx和Apache之类的  
```bash
cd letsencrypt
./letsencrypt-auto certonly --standalone -d yourdomain.tld -d www.yourdomain.tld

```
yourdomain替换成你自己的域名，可以是二级域名。后续要去添加DNS解析。

### 4. 为Ngnix安装证书<a id="sec-1-1-4" name="sec-1-1-4"></a>

证书文件存放放/etc/letsencrypt/lives目录下

vim /etc/nginx/nginx.conf
添加一下内容
```bash
  server {
      listen 80;
      listen [::]:80;
      server_name data.3gods.com
  
      return 301 https://$host$request_uri;
  }
  server {
          listen 443 ssl;
          server_name 域名;
          ssl_certificate /etc/letsencrypt/live/域名/fullchain.pem;
          ssl_certificate_key /etc/letsencrypt/live/域名/privkey.pem;
          ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
          ssl_prefer_server_ciphers on;
          ssl_dhparam /etc/ssl/certs/dhparam.pem;
          ssl_ciphers 'xxxx'
          ssl_session_timeout 1d;
          ssl_session_cache shared:SSL:50m;
          ssl_stapling on;
          ssl_stapling_verify on;
          add_header Strict-Transport-Security max-age=15768000;
          # The rest of your server block
          root /path/to/root;
          index index.html index.htm;
          location / {
                  try_files $uri $uri/ =404;
               }
         }
```

重启Ngnix
service nginx restart

### 5. 自动化重新生成证书：<a id="sec-1-1-5" name="sec-1-1-5"></a>

因为letsencrypt会自动过期，可以使用linux的crotab。  
使用crontab -e命令，添加以下内容  
```bash
0 0 1 * * /usr/bin/certbot renew --force-renewal
5 0 1 * * /usr/sbin/service nginx restart
```

也可以使用./letsencrypt-auto renew命令自动续期。

## 参考文章与扩展阅读<a id="sec-1-2" name="sec-1-2"></a>

[Setting Up HTTPS with Let’s Encrypt SSL Certificate For Nginx on RHEL/CentOS 7/6](https://www.tecmint.com/setup-https-with-lets-encrypt-ssl-certificate-for-nginx-on-centos/)
