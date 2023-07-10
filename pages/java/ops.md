---
layout: page

show_meta: false
title: "运维"
subheadline: ""
header:
   image_fullwidth: "header_unsplash_5.jpg"
permalink: "/ops/"
---
<ul>
    {% for post in site.categories.ops %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>