---
layout: page

show_meta: false
title: "简历"
subheadline: "Java程序员如何写好一份技术简历"
header:
   image_fullwidth: "header/career.jpg"
permalink: "/resume/"
---
<ul>
    {% for post in site.categories.resume %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>