---
layout: page

show_meta: false
title: "股票"
subheadline: "不炒为赢"
header:
   image_fullwidth: "header/stock.jpg"
permalink: "/stock/"
---
<ul>
    {% for post in site.categories.stock %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>