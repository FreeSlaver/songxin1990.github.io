---
layout: page

title: 用七牛做图床谨防被流量攻击
category: webmaster
categoryStr: 网站建设
tags: [qiniu,attack,flux]
keywords: 七牛,图床,流量攻击
description: 
---


早上刚来公司，收到一条短信，七牛告知我账号欠费318块，未出账单金额389块。我的个天，赶紧上去看看。  
发现5月14日左右被刷掉了1600多G，谁TM这么无聊？后台查看访问ip，再查下ip地址，第一是俄罗斯的，还有新加坡和香港的，很明显的是被恶意刷流量了。  

提了工单，然后自己也搜索资料搞了下防盗链。工单的相应也是那么简单的几个处理方式，而且说我这账单免不了。  
之前在搜索资料，看到V2EX上也有人遭遇到，而且幸运的被免单了，其实我也不指望免单，但是不能期望全部账单我负。   
很明显，这个1600多G是一个非常短暂的时间内刷出来的，七牛可以通过自主判断出来，然后拒掉此IP。  
没办法，这账号只能弃之不用了，300多块啊。虽然我认为七牛的服务蛮不错，稳定性也还行，但是这个真不是我的问题，  
后台也没设置能超过多少流量，自动掐断的设置。而且提前也没告警，短信通知我。 

所以，只能用qshell将图片批量下载下来。需要先下载qshell。  

## 空间迁移<a id="sec-1-1" name="sec-1-1"></a>

首先将所有空间，也就是bucket的图片迁移到一个空间里面。  

```bash
//登录
qshell-windows-x64.exe account <AccessKey> <SecretKey>  
//遍历空间文件
qshell-windows-x64.exe listbucket porker porker.txt
//只需要文件名称
cat porker.txt | awk '{print $1}' > porker2.txt
//将porker空间文件批量转移到gitblog中
qshell-windows-x64.exe batchcopy porker gitblog porker2.txt
```

## 空间文件批量下载<a id="sec-1-2" name="sec-1-2"></a>

需要先建一个配置文件batch.conf，输入相关参数。之后执行qdownload命令。
```bash
vi batch.conf
{
"dest<sub>dir</sub>" : "F:/images/", //下载文件保存的目录
"bucket" : "gitblog", //空间名
"domain" : "img.3gods.com", //空间对应的域名
"access<sub>key</sub>" : <AccessKey>,
"secret<sub>key</sub>" : <SecretKey>,
"is<sub>priveate</sub>" : false, //是否私有空间
"prefix" : "",
"suffix": ""
}

qshell-windows-x64.exe qdownload 10 batch.conf
```