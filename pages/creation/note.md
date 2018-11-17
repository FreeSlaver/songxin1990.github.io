---
layout: page
breadcrumb: true
show_meta: false
title: "笔记"
subheadline: ""
header:
   image_fullwidth: "header/note.jpg"
permalink: "/note/"
---
<ul>
    {% for post in site.categories.note %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>