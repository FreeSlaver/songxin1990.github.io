---
layout: page

show_meta: false
title: "精华帖"
subheadline: "本站原创精华文章收录"
header:
image_fullwidth: "header/career.jpg"
permalink: "/essence/"
---
<ul>
    {% for post in site.tags.essence %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>