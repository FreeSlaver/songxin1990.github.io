---
layout: page
breadcrumb: true
show_meta: false
title: "搞钱"
subheadline: "搞钱，有钱就有尊严和自由"
header:
   image_fullwidth: "header/makemoney.jpg"
permalink: "/makemoney/"
---
<ul>
    {% for post in site.categories.makemoney %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>