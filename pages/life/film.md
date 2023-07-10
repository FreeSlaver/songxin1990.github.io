---
layout: page

show_meta: false
title: "影评"
subheadline: ""
header:
   image_fullwidth: "header_unsplash_5.jpg"
permalink: "/film/"
---
<ul>
    {% for post in site.categories.film %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>