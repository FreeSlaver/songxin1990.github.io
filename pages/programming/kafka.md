---
layout: page
breadcrumb: true
show_meta: false
title: "kafka"
subheadline: ""
header:
   image_fullwidth: "header_unsplash_5.jpg"
permalink: "/kafka/"
---
<ul>
    {% for post in site.categories.kafka %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>