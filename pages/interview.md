---
layout: page

show_meta: false
title: "面试"
subheadline: "面试题"
header:
image_fullwidth: "header/career.jpg"
permalink: "/interview/"
---
<ul>
    {% for post in site.tags.interview %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>