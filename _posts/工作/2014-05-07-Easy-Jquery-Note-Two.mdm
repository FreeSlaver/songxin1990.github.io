---
layout: post
title: 锋利的JQuery学习笔记一（选择器）
category: 工作
tags: 
keywords: 
description:锋利的JQuery学习笔记一（选择器） 
---



DOM是一种与浏览器，平台，语言无关的接口。其实我个人觉得最底层就是数据结果中的树，所以可以实现跨平台和语言无关，因为这个涉及到了最底层的数据结构和算法。是编程的基础。
DOM操作分为3个方面，DOM Core,HTML-DOM,CSS-DOM.
DOM core可以用来处理任何一种使用标记语言编写的文档，例如XML。

HTML-DOM是处理Html特有的。document.forms，提供一个forms对象，element.src获取元素的src属性
CSS-DOM是针对CSS的操作，主要作用是获取和设置style对象的各种属性。element.style.color="red"
真正的DOM操作并非那么简单，在DOM操作中，常常需要动态创建HTML内容，是文档在浏览器里的呈现效果发生变化，并且达到各种各样的人机交互的目的。
创建元素节点
使用$(html)方法会根据传入的HTML标记字符串，创建一个DOM对象，并将这个DOM对象包装成一个jQuery对象返回。
var $li_1 = $("<li></li>")
var $li_2 = $("<li></li>")

添加节点：
使用jQuery中的append()方法将这个元素插入文档。
$("ul").append($li_1).append($li_2),那么如果将$li_2添加到$li_1后面了？应该是$("ul").append($li_1.append($li_2))。不过好像应该是要写在外面？$("ul").append($li_1);$li_1.append($li_2)
动态创建的新元素节点不会被自动添加到文档中，而是需要使用其他方法。
将新创建的节点插入文档最简单的办法是，让它成为这个文档的某个节点的子节点。

append(),appendTo(),prepend(),prependTo(),after(),insertAfter(),before(),insertBefore();
也可以使用上面的方法来移动元素。

删除节点：
remove(),detach(),empty()
remove()方法删除后，该节点所包含的所有后代节点就被同事删除。返回一个指向一杯删除的节点的引用。因此可以继续使用这些元素。
detach()从DOM中去掉所有匹配的元素。但是不会删除掉时间，附加的数据。
empty()清空节点下的所有元素。


复制节点：
商品拖动功能就是用的复制节点，将用户选择的商品所处的节点元素复制一次，并将其跟随鼠标移动，从而达到购物效果。
$("ul li").click(function(){
   //  $(this).clone().appendTo("ul"); 
     $(this).clone(true).appendTo("ul");复制出来的节点也具有被点击后的复制功能
})

替换节点：
使用repalceWith()和replaceAll()
$("p").replaceWidth("你最不喜欢的是")
$("你最不喜欢的是").replaceAll("p");替换节点后上门的绑定事件会消失。

包裹节点：
$("strong").warp("<b></b>");//用<b>标签把<strong>元素包裹起来
另外的2个方法wrapAll()和wrapInner();

节点属性：
修改节点属性：$("p").attr("title","exchange");
获得节点属性：var achive = $("p").attr("title");
删除节点属性：$("p").removeAttr("title");

标签中的class一般指定的是样式。
节点样式操作：
<p class="oldClass">Test Class</p>
获取样式:$("p").attr("class");
修改样式:$("p").attr("class","newClass");
删除样式:$("p").remove("oldClass");无参数就是删除所有
追加样式: $("p").addClass("addClass");
切换样式: $("p").toggleClass("otherClass");
是否含有样式:$("p").hasClass("oldClass");$("p").is(".another")

标签中的HTML和文本
<p title="选择你最喜欢的水果." ><strong>你最喜欢的水果是?</strong></p>
$("p").html();
$("p").text();
HTML和TEX是有区别的，html是获得这个标签包裹的所有HTML代码,text是获得里面的文本。


节点属性操作归纳：
无参数就是获得，有参数就是设置，remove就是删除。
jQuery中使用==和is()来判断2个字符串是否相等。
$("#address").focus(function(){
     var text_val = $(this).val();
     //if(text_val=="输入邮箱"){
     if((text_val == this.defaultValue)
          text_val =" "//这个不行，只是将变量设置为" "
          $(this).val(" ");
     }
});
$("#address").blur(function(){
     $(this).val("");     
});
可以使用属性defaultValue代替

select,checkbox,radio这几个标签常用属性:
<select multiple="multiple">
     <option selected="selected"></option>
</select>
<input type="checkbox" checked="checked"/>
<input type="radio"/>
$("[value=check2]:checkbox").attr("checked",true);
//选取属性value=check2，并过滤出checkbox然后设置属性checked的值为true.


DOM节点遍历:
使用$("ul").children();
使用next(),prev(),sibling()来获得同辈后一个元素，同辈前一个元素，同辈中的元素。
closest():取得最近的匹配元素。
$(document).bind("click",function(e){
     $(e.target).closest("li").css("color","red");
})
jQuery中海油很多遍历节点的方法，例如find(),filter(),nextAll(),prevAll()，参数里面都可以写jQuery的表达式。

CSS-DOM
jQuery使用$("p").css("color")获得元素的颜色。

offset()方法获得偏移
var offset = $("p").offset();
var left = offset.left;
var top = offset.top;




function(){}这样的写法，无参数，参数应该就是this，当前对象?有待考察


