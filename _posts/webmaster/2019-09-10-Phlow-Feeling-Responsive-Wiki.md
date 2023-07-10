---
layout: page

title: Feeling Responsive Phlow创作的Jekyll主题使用例子总结
category: webmaster
categoryStr: 网站建设
tags: [jekyll-theme]
keywords: 
description: 
---

现在最重要的一件事是如何防范重蹈覆辙，
## 开始
1. 修改logo，在/assets/img/中替换掉favicon-32x32.ico
2. 修改社交链接，在_data/socialmedia.yml.
3. 修改主题颜色，在_sass/_01_settings_colors.scss
4. 修改导航栏，在_data/navigation.yml
5. 改变主题语言，_data/language.yml.
6. 修改footer链接，_data/services.yml 和 _data/network.yml.
7. 设置作者信息，_data/authors.yml，设置默认作者，在config.yml


## page post格式
page，post格式默认没有侧边栏，内容居中，内容下方显示分类，标签，日期，作者
### page post格式添加侧边栏
在头文件中添加sidebar: left或者sidebar: right，打开_includes/sidebar自定义侧边栏。
### metadata开启关闭
show_meta: true，默认开启，在_config.yml中修改
### 页面完全控制
layout: page-fullwidth
### 首页
使用layout: frontpage，It allows you to define three widgets which are displayed with a headline, image, description and a link to the content
### 添加单页视频
使用layout: video，能全屏展示

## 内容的Style
### subheadlines 次标题
subheadline: "这是个次级标题"
### Quotes引用

> Age is an issue of mind over matter. If you don't mind, it doesn't matter.
<cite>Mark Twain</cite>
<small markdown="1">[Up to table of contents](#toc)</small>
{: .text-right }
 
### 评论
config.yml文件中添加disqus_shortname
### 添加自适应视频
<div class="flex-video">
  <iframe with video />
</div>

## 图片设置

### 标题图片
image:
    title: image.jpg

### 缩略图
缩略图用于归档页面，150x150
image:
    thumb: thumbnail_image.jpg

### 主页图
如果想在主页大标题展示一篇文章，
image:
    homepage: header_homepage_13.jpg

### 图片加上备注
image:
    title: header_image.jpg
    caption: Image by Phlow
    caption_url: "http://phlow.de/"

### 文章所有图片定义
image:
    title: title_image.jpg
    thumb: thumbnail_image.jpg
    homepage: header_homepage_13.jpg
    caption: Image by Phlow
    caption_url: "http://phlow.de/"

## 创建目录
在文章内容前插入下列html代码  
骨架版
```
### Table of Contents
*  Auto generated table of contents
{:toc}
```
foundation面板版
```
<div class="panel radius" markdown="1">
**Table of Contents**
{: #toc }
*  TOC
{:toc}
</div>
```
## 面包屑
打开面包屑 