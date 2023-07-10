---
layout: page

title: 随机地从集合中取元素
category: java
categoryStr: java
tags: 
keywords: 
description: 
---
<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">


<ul>
<li><a href="#sec-1-1">1.1. 从List中随机取元素</a>
<ul>
<li><a href="#sec-1-1-1">1.1.1. 取一个元素</a></li>
<li><a href="#sec-1-1-2">1.1.2. 取多个元素，比如20个</a></li>
</ul>
</li>
<ul>
<li><a href="#sec-1-2">1.2. 从Set中随机取元素</a></li>
<li><a href="#sec-1-3">1.3. 从Map中随机取元素</a></li>
</ul>
</li>
</ul>
</div>
</div>



## 从List中随机取元素<a id="sec-1-1" name="sec-1-1"></a>

### 取一个元素<a id="sec-1-1-1" name="sec-1-1-1"></a>

```
List<String> list = new ArrayList<String>();
for(int i=0;i<1000;i++){
  String iStr = String.valueOf(i);
  list.add(iStr);
}
Random random = new Random();
int nextInt = (int)(random.nextDouble()*list.size());
list.get(nextInt);
```
### 取多个元素，比如20个<a id="sec-1-1-2" name="sec-1-1-2"></a>

```
Collections.shffle(list);
list.subList(0,20);
```
## 从Set中随机取元素<a id="sec-1-2" name="sec-1-2"></a>

先将set转为list，之后操作同上。 
```
List<String> list = new ArrayList<String>(set);
```
## 从Map中随机取元素<a id="sec-1-3" name="sec-1-3"></a>

```java
List<String> list = new ArrayList<String>(map.values());
```
之后操作同上。
