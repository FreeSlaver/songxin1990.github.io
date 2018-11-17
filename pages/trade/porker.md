---
layout: page
breadcrumb: true
show_meta: false
title: "德州扑克"
subheadline: "只有上帝才能不赌博"
header:
   image_fullwidth: "header/porker.png"
permalink: "/porker/"
---
<ul>
    {% for post in site.categories.porker %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>