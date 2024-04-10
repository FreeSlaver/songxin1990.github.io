---
layout: page

show_meta: false
title: "面试"
subheadline: 面试技巧，面试经验
header:
   image_fullwidth: "header/career.jpg"
permalink: "/interview/"
---
<ul>
    {% for post in site.categories.interview %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>