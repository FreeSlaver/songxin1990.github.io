---
layout: page

show_meta: false
title: "职场"
subheadline: "职场是一趟所有人必须趟的浑水"
header:
   image_fullwidth: "header/career.jpg"
permalink: "/career/"
---
<ul>
    {% for post in site.categories.career %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>