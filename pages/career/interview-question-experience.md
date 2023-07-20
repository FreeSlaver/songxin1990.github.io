---
layout: page

show_meta: false
title: "面试题面经"
subheadline: "21世纪的八股进士"
header:
   image_fullwidth: "header/career.jpg"
permalink: "/interview-question-experience/"
---
<ul>
    {% for post in site.categories.interview-question-experience %}
    <li><a href="{{ site.url }}{{ site.baseurl }}{{ post.url }}">{{ post.title }}</a></li>
    {% endfor %}
</ul>