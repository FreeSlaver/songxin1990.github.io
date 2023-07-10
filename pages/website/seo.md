---
layout: page

show_meta: false
title: "SEO"
subheadline: ""
header:
   image_fullwidth: "header/seo.jpg"
permalink: "/seo/"
---
<ul>
    {% for post in site.categories.seo %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>