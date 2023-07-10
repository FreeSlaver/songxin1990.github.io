---
layout: page

title: 使用htaccess对虚拟主机进行301重定向
category: webmaster
categoryStr: 网站建设
tags: [webmaster]
keywords: [虚拟机,301重定向,jekyll,htaccess]
description: 网站通过备案，将github上的jekyll博客搬到了阿里云万网虚拟主机，使用htacess进行301重定向
---

最近<a href="/">我的网站</a>通过备案了，所以将github上的jekyll博客搬到了万网的虚拟主机上。  
因为需要对url和网站结构进行SEO，所以将所有url链接的结构改成了：http://域名/目录/标题.html的形式。 
<br>

因为虚拟主机不是jekyll服务器，用户访问虚拟机上的内容本质上就是读取文件，还好jekyll生成的都是静态网页。  
但是url的301重定向成了问题，通过google知道虚拟机可以使用.htaccess文件进行重定向，试了一下，的确可以。  
<br>


但全部的url也有近300个，不可能一个个手写，所以就写了一个java小程序。  
通过修改_config.yml文件，得到2个sitemap.xml，一个旧的的和一个新的，  
然后用程序读取2个里面的url地址，通过标题映射到旧的和新的url，然后组装成以下格式：  
Redirect /2016/04/29/Java-Tech-Blog.html /trash/Java-Tech-Blog.html  
<br>


要注意的是：不要带域名；还有就是如果像下面这样：  
Redirect /2016/ /bigdata/  
这样就会将所有url中含有/2016/的全部替换成/bigdata/，那么http://域名/2016/xx.html就重定向成了http://域名/bigdata/xx.html，切忌。     
<br>


具体代码：  
```java
public class BlogUrlRedirect {

    public static void main(String[] args) throws IOException {
        redirectAllUrls();

    }

    public static void redirectAllUrls() throws IOException {
        String oldSitemap = "F:\\sitemap\\old\\sitemap.xml";
        String newSitemap = "F:\\sitemap\\new\\sitemap.xml";
        
        List<String> oldUrls = getAllUrl(oldSitemap);
        List<String> newUrls = getAllUrl(newSitemap);
        
        Map<String,String> oldUrlMap = new HashMap<String, String>();
        Map<String,String> newUrlMap = new HashMap<String, String>();
        for(String oldUrl:oldUrls){
            int lastbackslash = oldUrl.lastIndexOf("/");
            String title = oldUrl.substring(lastbackslash);
            oldUrlMap.put(title,oldUrl);
        }
        for(String newUrl:newUrls){
            int lastbackslash = newUrl.lastIndexOf("/");
            String title = newUrl.substring(lastbackslash);
            newUrlMap.put(title,newUrl);
        }

        List<String> redirectLines = new ArrayList<String>();
        for(Map.Entry<String,String> entry:oldUrlMap.entrySet()){
            String title = entry.getKey();
            String oldUrl = entry.getValue();
            String newUrl = newUrlMap.get(title);
            String redirectLine = "Redirect "+ oldUrl+" "+newUrl+"\n";
            redirectLines.add(redirectLine);
        }
        redirectLines.add(0,"RewriteEngine On\n");
        //生成.htaccess
        File file = new File(".htaccess");
        FileUtil.append(file,redirectLines);
    }

    public static List<String> getAllUrl(String filepath) throws IOException {
        List<String> list = FileUtils.readLines(new File(filepath), "utf-8");

        List<String> urls = new ArrayList<String>();
        for (String s : list) {
            if (s.startsWith("<loc>")) {
                s = s.replace("<loc>", "");
                s = s.replace("</loc>", "");
                s = s.replace("http://localhost:4000","");
                if (s.endsWith(".html")) {
                    urls.add(s);
                }
            }
        }
        return urls;
    }
}

```
<br>

最终效果:  
```
RewriteEngine On
Redirect /2017/04/11/Google-Tips.html /tips/Google-Tips.html
Redirect /2015/09/10/Auto-Deploy-Config.html /trash/Auto-Deploy-Config.html

```

希望本文对你有用，特别是那些将github上的jekyll博客搬回到国内虚拟主机的人。  

