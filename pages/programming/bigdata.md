---
layout: page
breadcrumb: true
show_meta: false
title: "大数据"
subheadline: ""
header:
   image_fullwidth: "header_unsplash_5.jpg"
permalink: "/bigdata/"
---
<ul>
    {% for post in site.categories.bigdata %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>