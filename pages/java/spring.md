---
layout: page

show_meta: false
title: "Spring"
subheadline: ""
header:
   image_fullwidth: "header_unsplash_5.jpg"
permalink: "/spring/"
---
<ul>
    {% for post in site.categories.spring %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>