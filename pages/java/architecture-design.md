---
layout: page

show_meta: false
title: "架构设计"
subheadline: ""
header:
image_fullwidth: "header_unsplash_5.jpg"
permalink: "/architecture-design/"
---
<ul>
    {% for post in site.categories.architecture-design %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>