---
layout: page

show_meta: false
title: "项目经验总结"
subheadline: "性能优化线上故障系统重构"
header:
   image_fullwidth: "header_unsplash_5.jpg"
permalink: "/project/"
---
<ul>
    {% for post in site.categories.project %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>