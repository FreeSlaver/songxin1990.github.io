---
layout: page
breadcrumb: true
show_meta: false
title: "禅"
subheadline: ""
header:
   image_fullwidth: "header/zen.jpg"
permalink: "/zen/"
---
<ul>
    {% for post in site.categories.zen %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>