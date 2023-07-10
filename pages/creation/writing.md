---
layout: page

show_meta: false
title: "写作"
subheadline: ""
header:
   image_fullwidth: "header/note.jpg"
permalink: "/writing/"
---
<ul>
    {% for post in site.categories.writing %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>