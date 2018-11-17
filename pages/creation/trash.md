---
layout: page
breadcrumb: true
show_meta: false
title: "废弃"
subheadline: ""
header:
   image_fullwidth: "header/default.jpg"
permalink: "/trash/"
---
<ul>
    {% for post in site.categories.trash %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>