---
layout: page

show_meta: false
title: "小贴士"
subheadline: ""
header:
   image_fullwidth: "header/tips.jpg"
permalink: "/tips/"
---
<ul>
    {% for post in site.categories.tips %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>