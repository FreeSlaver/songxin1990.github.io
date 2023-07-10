---
layout: page

show_meta: false
title: "分布式"
subheadline: ""
header:
   image_fullwidth: "header_unsplash_5.jpg"
permalink: "/distribute/"
---
<ul>
    {% for post in site.categories.distribute %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>