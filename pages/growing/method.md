---
layout: page

show_meta: false
title: "方法论"
subheadline: ""
header:
   image_fullwidth: "header_unsplash_5.jpg"
permalink: "/method/"
---
<ul>
    {% for post in site.categories.method %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>