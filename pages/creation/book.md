---
layout: page
show_meta: false
title: "书单"
breadcrumb: true
subheadline: ""
header:
   image_fullwidth: "header/book.jpg"
permalink: "/book/"
---
<ul>
    {% for post in site.categories.book %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>