---
layout: page

title: 规则引擎？看这篇就够了
category: java
categoryStr: java
tags: [ruleengine]
keywords: [规则引擎,方案,drools]
description: 
---

<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. 规则引擎？看这篇就够了</a>
<ul>
<li><a href="#sec-1-1">1.1. 什么是规则引擎？</a></li>
<li><a href="#sec-1-2">1.2. 为什么需要规则引擎，它解决什么问题？</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. 规则引擎语义</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. 程序设计及具体实现</a>
<ul>
<li><a href="#sec-1-3-1">1.3.1. 要考虑的一些问题</a></li>
</ul>
</li>
<li><a href="#sec-1-4">1.4. 规则引擎的优缺点</a>
<ul>
<li><a href="#sec-1-4-1">1.4.1. 优点</a></li>
<li><a href="#sec-1-4-2">1.4.2. 缺点</a></li>
</ul>
</li>
<li><a href="#sec-1-5">1.5. 规则引擎相关的技术产品</a></li>
<li><a href="#sec-1-6">1.6. 参考资料和扩展阅读</a></li>
</ul>
</li>
</ul>
</div>
</div>



## 什么是规则引擎？<a id="sec-1-1" name="sec-1-1"></a>

首先，我们将这4个字拆分成2个单独的有语义的词语：规则+引擎。  
何为规则？举个例子，我们过马路，必须要等到绿灯亮，然后走斑马线过马路。  
（当然有些素质差，不怕死，赶时间的并不遵守规则）。  

引擎，发动机的核心部分，也经常用来指代发动机。拿汽车的发送机举例：  
我们插入并拧动汽车钥匙，发动引擎，引擎通过烧汽油，产生动力，让汽车跑起来。  
**引擎的作用是：使得特定事物运转起来。**  

我写这么多，不是在咬文嚼字，试想一下：如果你是第一次接触规则引擎这个单词，怎么去理解它？  

我在这里强调的是： **当我们面对一个新事物，新名词的时候，如何直接开动大脑去理解它** ，  
而不需借助于外力，比如搜索引擎，看书，询问他人，因为后面的方式效率太低。  

所以， **从现实世界映射到软件工程上** ，规则引擎就是：  
**在符合特定规则条件下，去做某件事情，并得到期望的结果。**  

## 为什么需要规则引擎，它解决什么问题？<a id="sec-1-2" name="sec-1-2"></a>

规则引擎的产生，这个要从我们写业务代码说起，比如：  
快递员向快递柜中投递了一个用户的包裹，与此同时需要发送一条含取件码的短信。  

程序的处理流程是：  
接收输入（包裹信息）->参数校验，取出用户手机号，包裹取件码->发送短信。  
这是一种是非常确定的需求，简单点来看就是：一系列的条件判断，循环和数据访问修改而组成的线性的流程处理。  

但是面对大量不确定性或者已确定但参数变化太快的需求，怎么办？  
上面这种方式将参数校验，逻辑判断，功能执行的操作都耦合在了一起，对软件后期需求改动非常不利。  
规则引擎要做的就是：使得替换掉这条流程中的特定条件和符合条件后的特定操作的成本非常低。  

现在我们来举例：  
一个商场进行促销，金牌会员满100，减10块，送一个玩具，并免费配送；  
银牌会员，满100，减10块，免费配送；普通会员，满100，免费配送。  
假设，某天到了情人节，情侣都是金牌会员，买情趣用品，满100减10块，balabala。。。单人购买无任何优惠。  
过段时间又到了光棍节，程序员满1000送娃娃，未婚金牌会员满100减10块，已婚无优惠。  
再过段时间是元旦节，春节等等。  
这时候，又要改动业务代码了，工作量非常的大，改动起来成本很高，而且不可能每年都轮着改一次吧？   

这个的业务需求就是：在特定的节假日（条件），商场进行特定的促销活动（行动），以达到促进顾客消费多赚钱的目的。  
因此，我们需要将特定的节假日进行的促销活动，和用户扣款，积分等通用代码解耦开来，  
并且，商场运营人员还能对促销活动进行随时，快速的更改，以达到更好的效果。  

比如primary day，亚马逊发现很多书打完折，还有折扣，亏本了，就可以对没看到此优惠信息的用户马上修改规则。（纯属YY）  
又或者看到促销效果很好，添加更多的滞销商品进去，如此等等。  

### 规则引擎语义<a id="sec-1-2-1" name="sec-1-2-1"></a>

规则引擎可以用以下非常简单，简洁的语义表达：  
如果发生了X，那么我们做Y。  
if X then Y  

X具体是什么，我们不知道，但是如果发生了X，那么我们肯定想要一个Y，具体Y是什么，还是不知道（cao）。  
X不知道没关系，因为是可以随时添加的。Y也是要可以随时调整的。  

所以，规则引擎，应对的是： **不明确的业务需求，以及明确但可能大量快速变动的需求。**  
**规则引擎甚至可看做是用程序去满足现实世界中的多样性和多变性** ，但这个本身就不是程序的强项。  

## 程序设计及具体实现<a id="sec-1-3" name="sec-1-3"></a>

首先我们看之前的定义：  
如果发生了X，那么我们做Y。  

举个例子：如果老天开始下雨，那么我们打伞。  
这里的描述，就是如果发生某事件：下雨（Fact），那么我们做某动作：打伞（Condition）。  
但是老天也可能下雪，下冰雹，这些都是Fact，只有Fact是下雨（Condition），我们才打伞。
```
Fact weather;
if(weather is rain) then open umbrella;
if(weather is snow) then see snow;
if(weather is hail) then run;
```

Fact就是一个事件，就是一个对象，我们先定义一个Fact的接口  
```
public interface Fact{  

}  
```
Condition就是一个判断条件：  
```
public interface Condition{  
   boolean isMeet(Fact fact);  
}  
```
Action就是要执行的一个动作：   
```
public interface Action{  
    Fact execute(Fact fact);  
}  
```
规则，就是在满足某些条件下，做某个动作，其实就是Condition和Action的组合：  
```
public interface Rule extends Condition,Action{  

}  
```
规则引擎就是：来了一个外部事件Fact，我们使用对应的Rule来处理它。  
```
public interface RuleEngine{  
    Fact fire(Rule rule,Fact fact); //这个地方有点存疑，貌似解耦掉Rule的代码会更好  
}  
```
我们需要实现的就是特定的规则，只需要实现Rule接口就行了，伪代码程序API范式：  

```
public class RainFact implements Fact{  
    //rain properties  
}  
```

```
public class RainRule implements Rule{  
    public boolean isMeet(Fact fact){  
         if(fact instanceof RainFact){  
             return true;//在这里还可以取出属性，做条件判断  
         }  
    }
    public Fact execute(Fact fact){
        RainFact fact = (RainFact)fact;
        System.out.println("open umberlla");
        return new ResultFact(success);
    }
}
```

### 要考虑的一些问题<a id="sec-1-3-1" name="sec-1-3-1"></a>

1.  一个Fact来了，我应该用哪个Rule来处理，也就是如何建立Fact和Rule之间的映射关系。  
我看EasyRule中的是遍历所有的Rule以得到Fact满足条件的Rule，用此Rule来执行，这样执行的效率会非常低。  

2. 规则执行完毕后，对结果如何处理？ 
也就是执行成功，和执行失败后如何处理？我看EasyRule中是添加Listener，也就是回调函数，  
对执行成功和执行失败，进行自定义的后续处理。但是很明显，这里引入了Listener的概念，程序的边界扩大了，  
而且有些规则本身的定义就是：如果发生了X，那么我们做Y，如果做Y失败了，我们使用方案W。  
而这里W成了EasyRule的Listener，而本质上这个W也是一个Action。  
**更本质来说：得到的结果本身就是一个Fact，而这个Fact满足执行W的Condition。**  

3. 规则调用链  
如果发生了X，那么我们做Y，如果做Y失败了，我们启用方案A，如果方案A失败，我们启用方案B...;.  
后续的条件Condition和Action可以无穷无尽的链接下去，甚至可以做成一个二叉树。  
这也可以认为是一种事件的流式处理，链式处理。  

## 规则引擎的优缺点<a id="sec-1-4" name="sec-1-4"></a>

### 优点<a id="sec-1-4-1" name="sec-1-4-1"></a>

1. 可应对快速变化的商业业务逻辑  
2. 规则可插播，外部化。与应用代码分离，解耦  

### 缺点<a id="sec-1-4-2" name="sec-1-4-2"></a>

1. 难以debug，因为规则引擎就是个黑盒子  
2. 使用过或者废弃了的规则没人维护，也不好从代码中删除  
3. 要给非技术人员界面用来配置规则，并将规则转换，映射到具体执行代码中  
4. 规则越来越多，项目越来越臃肿，更加难以维护  
5. 规则数量的增多和判断判断的速度会影响引擎的执行效率  
6. 没有else  

## 规则引擎相关的技术产品<a id="sec-1-5" name="sec-1-5"></a>

1. Drools  
2. ILog JRules  
3. JSR94  

## 参考资料和扩展阅读<a id="sec-1-6" name="sec-1-6"></a>

[RulesEngine-MartinFowler](https://martinfowler.com/bliki/RulesEngine.html)  
[Easy Rule](https://github.com/j-easy/easy-rules)  
