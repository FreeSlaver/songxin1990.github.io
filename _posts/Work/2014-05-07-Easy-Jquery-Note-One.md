---
layout: post
title: 锋利的JQuery学习笔记一（选择器）
category: 工作
tags: work,java
keywords: 
description:锋利的JQuery学习笔记一（选择器） 
---



DOM，Document Object Model文档对象模型。每一个DOM都可以表示成树

DOM是通过JAVASCRIPT中的getElementsByTagName或者getElementByID来获得元素节点，这样得到的元素就是DOM对象。

var domObj = document.getElementByID("id");
var ObjHtml = domObj.innerHtml;//innerHtml是属性，元素一般都是属性

JQuery对象是通过JQuery包装DOM对象后产生的对象
DOM和JQuery中的任何方法不能互相使用

JQuery对象提供了2种方法将一个JQuery对象转换成DOM对象，即【index】和get(index).
1.通过【index】
var $cr = $('#cr');
var cr = $cr[0];
2.通过get(index)
var $cr = $('cr');
var cr = $cr.get(0);

DOM对象转换成JQuery对象,只需要放入$()中就行了
var cr = document.getElementById("cr");
var $cr = $(cr)
平时使用的jquery对象都是通过$()函数制造的

$(document).ready(function(){
     var $ cr = $("#cr");
     var cr = $cr[0];
     $cr.click(function(){
          if(cr.checked){//DOM的方法
               alert("3q");
          }
     });

     $cr.click(function(){
          if($cr.is(":checked")){
               alert("sq");
          }
     });
});

//DOM和Jquery中的方法不能相互使用，但是在Jquery的function中却可以使用DOM的方法

调用jQuery.noConflict()将$的控制权交给其他JAVASCRIPT库
也可以自定义快捷方式
var $j = jQuery.noConflict()//我们可以将$符号看做是jQuery对象的实例

不想改名又怕冲突
方法一：
jQuery.noConfilict();
jQuery(function($){
     $("#pp").click(function(){
          alert($(this).html());
     });
});
方法二：
jQuery.noConflict();
(function($){
     $(function{
          $("#pp").click(){
             alert($(this).text());
          };
     });
})(jQuery)

也就是这种写法：(function($){})(jQuery),有点类似递归的写法，在里面是function($)，在外面是一个()(jQuery).

要使某个样式应用于特定的HTML元素，首先需要找到该元素，这种功能称为CSS选择器。最基本的选择器是就是3种，标签，id，class，还有attr不是很常用
jQuery中的选择器一般写法是$("tag"),$("#id"),$(".class").
jQuery中的选择器完全继承了CSS的风格。所以CSS中有的选择器写法，jQuery中应该也支持
jQuery编程或者JAVA编程，都是首先获得对象，然后调用对象的方法来实现功能，然后将各种功能排列组合就形成了软件。

jQuery选择器支持CSS1，CSS2的全部选择器和CSS3的部分选择器。
设置样式属性是document.getElementById('#id').style.color="red"

$()得到的永远是对象，是一个数组，所以判断某一个元素是否存在的时候可以判断长度或者取得第一个元素看是否存在
if($("#id").length>0)
if($("#id").get(0))或者if($("#id")[0])对应于if(document.getElementById("id"))
jQuery对象和DOM对象，应该是jQuery对象是一个数组，数组中的元素放的是DOM对象。$(domElement)的操作应该是将DOM放入jQuery对象的数组中。

HTML都是DOM对象，可以结合XML理解，看做一棵树，每一个标签都是一个分支节点。每一个都是一个Element,document也是一个Element
都可以通过document.getElementById()或者document.getElementsByTagName()

DOM中可以通过name来获得元素数组：
document.getElementsByName("name").
jQuery中同样的实现通过：
$('obj[name="_name"]')，obj为table，input等

javascript创建数组：var arrays = new Array();
向里面添加数据arrays.push(item),取数据arrays.pop()?



jQuery选择器分为基本选择器，层次选择器，过滤选择器和表单选择器。

基本选择器：说的是通过id，class，标签名等来直接获得jQuery对象。$("#id"),$(".class"),$("tagName")

层次选择器：说的是DOM之间的层次关系的元素，后台元素，子元素，相邻元素和同辈元素等，也就是获取某一和当前元素有层级关系的元素。
$("div span")选取所有div标签中的所有span元素，比较常用。
$("div>span")选取所有div标签下的span子元素，也就是被选的必须是一个div的子元素，也就是如果是孙子元素就不会被选，比较常用。比如
<!--<div>
     <span name="span1"></span>
     <span name="span2"><span name="span3"></span></span>
     <span name="span4"><div><span name="span5"></span></div></span>
</div>-->
那么$("div span")会得到所有的，而$("div>span")只能得到span1,span2,span4,span5.
$("div,span,p.myClass")选取所有<div>,<span>和class为myClass的<p>标签。
$(".one+div")选取class为one的下一个<div>同辈元素。可以使用next()方法来替代，$(".one").next("div")(不知道参数，方法什么的，逻辑啊，多么的完美。)
$("#two~div")选取id为two的元素后面的所有<div>同辈元素。可以使用nextAll()方法替代。
siblings()方法可以匹配到同辈节点的所有前后元素。
$("#prev").siblings("div").css("background","#bbffaa");

过滤选择器：
过滤选择器是通过特定的过滤规则来刷选出所选的DOM元素。过滤规则与CSS中的伪类选择器语法相同，以:开头。过滤选择器分为基本过滤，内容过滤，可见性过滤，属性过滤，子元素过滤和表单对象属性过滤选择器。
基本过滤选择器：
$("div:first")
$("div:last")
$("input:not(.myClass)")
$("input:even")选取索引是偶数的<input>元素
$("input:odd")选取奇数
$("input:eq(3)")选取索引为3的<input>元素
$("input:gt(3)")
$("input:lt(3)")
$("div:header")
$("div:animated")选取正在执行动作的<div>元素

内容过滤选择器：主要是根据他包含的子元素或者文本内容上
$("p:contains("java fun")")
$("div:empty")
$(".mini:has(p)")选取class是.mini的元素下面含有<p>标签的元素
$("div:parent")选取有子元素的<div>也就是说parent是来修饰DIV的

可见性过滤选择器：根据元素的可见不可见状态来选择
$("div:hidden")选取隐藏的<div>元素
$("div:visible")选取可见的<div>元素
:hidden包括样式属性display:“none”也包括文本隐藏域<input type="hidden"/>和visibility:hidden之类的

属性过滤选择器：通过元素的属性来获取相应的元素
$("div[id]")
$("div[title=test]")
$("div[tittle!=test]")
$("div[title^=test]")选取div属性中title以test开头的div元素
$("div[title$=title]")
$("div[title*=test]")包含test
$("div[title|=’en‘]")选取title等于en或者以en为前缀的
$("div[title~=’uk‘]")选取属性title用空格分开的值中包含uk的元素
$("div[id][title$='test']")选取拥有id属性并且title属性的值包含test的div元素

子元素过滤选择器：
$("div:nth-child(even)")选取每个父元素中下的索引为偶数的子元素。
$("div:nth-child(3n)")选取每个父元素下索引为3的倍数的子元素
选取所有div中name="sx"的子元素

表单对象选择器：
$("#form1:enable")选取di为form1的表单内的所有可用元素
$("#form2:disable")
$("input:checked")
$("select:options:selected")选取所有被选中的选项元素

表单选择器：
$(":input")选取所有的<input>,<textarea>,<select>,<button>元素。
$(":text")
$(":password")
$(":radio")
$(":checkbox")
$(":submit")
$(":image")
$(":reset")
$(":button")
$(":file")


$("#tb tbody tr:even")获取id为tb的元素，然后寻找它下面的tbody标签，在寻找tbody下索引值是偶数的tr元素
空格就是说的是寻找当前元素下的子元素,是一个后代选择器

$("input[name='check']:cheked")选取所有input表单含有属性name的并且它的值为check，并且这个是已经被勾选的元素
jQuery中特殊字符串需要转义：比如<div id="id#b">bb</div>，那么$("#id#b")会出错，需要使用$("#id//#b").


判断是否可见
$().is(":visible");
在function中使用return false使得超链接不跳转，主要是让浏览器认为用户没有单击该超链接。
jQuery中的filter()方法刷选出符合要求的。
$("ul li").filter(":contains('佳能'),:contains('尼康')").css().text();//过滤器，过滤出ul下的li标签中含有文本佳能，尼康的元素
var $toggleBtn = $('div.showmore > a');
$toggleBtn.click(function(){
     $(this).find("span").css().text();//this指代的是$('div.showmore > a')这个对象
     //find找到这个对象中的span。
})

另外这一点对于搜索引擎优化也特别有帮助，并将当前的搜索引擎爬虫基本都不支持javascript。


