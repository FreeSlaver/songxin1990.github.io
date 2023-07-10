---
layout: page

title: MySQL索引为什么用B+树而不用二叉树，B树？
category: mysql
categoryStr: MySQL
tags: [interview]
keywords:
description:
---

有点东西啊小伙子，那二叉树呢？

二叉树的新增和结构如图：

https://mmbiz.qpic.cn/mmbiz_gif/uChmeeX1FpwUFWcYd1A97ia8Fde0dgBM8vEKVTV0Nz9o9ice339svnCPtn5860WAZCsPPrtS0MfG87sMyHujEBug/640?wx_fmt=gif&wxfrom=5&wx_lazy=1

Image
二叉树的结构我就不在这里多BB了，不了解的朋友可以去看看数据结构章节。

二叉树是有序的，所以是支持范围查询的。

但是他的时间复杂度是O(log(N))，为了维持这个时间复杂度，更新的时间复杂度也得是O(log(N))，那就得保持这棵树是完全平衡二叉树了。

怎么听你一说，平衡二叉树用来做索引还不错呢？

此言差矣，索引也不只是在内存里面存储的，还是要落盘持久化的，可以看到图中才这么一点数据，如果数据多了，树高会很高，查询的成本就会随着树高的增加而增加。

为了节约成本很多公司的磁盘还是采用的机械硬盘，这样一次千万级别的查询差不多就要10秒了，这谁顶得住啊？

如果用B树呢？

同理来看看B树的结构：

https://mmbiz.qpic.cn/mmbiz_gif/uChmeeX1FpwUFWcYd1A97ia8Fde0dgBM8IYtR31kyblb4uyrLUojDadqicRibvOVafNeXGAFTwXawic1icA3ATnAXzw/640?wx_fmt=gif&wxfrom=5&wx_lazy=1

Image
可以发现同样的元素，B树的表示要比完全平衡二叉树要“矮”，原因在于B树中的一个节点可以存储多个元素。

B树其实就已经是一个不错的数据结构，用来做索引效果还是不错的。

那为啥没用B树，而用了B+树？

一样先看一下B加的结构：

Image
https://mmbiz.qpic.cn/mmbiz_gif/uChmeeX1FpwUFWcYd1A97ia8Fde0dgBM82SzicfO5PFMebTh0WjXoyAEsd3Eu9H1CUsWTthVyI5gkqYfYm3cEtfg/640?wx_fmt=gif&wxfrom=5&wx_lazy=1

我们可以发现同样的元素，B+树的表示要比B树要“胖”，原因在于B+树中的非叶子节点会冗余一份在叶子节点中，并且叶子节点之间用指针相连。

那么B+树到底有什么优势呢？

其实很简单，我们看一下上面的数据结构，最开始的Hash不支持范围查询，二叉树树高很高，只有B树跟B+有的一比。

B树一个节点可以存储多个元素，相对于完全平衡二叉树整体的树高降低了，磁盘IO效率提高了。

而B+树是B树的升级版，只是把非叶子节点冗余一下，这么做的好处是为了提高范围查找的效率。

提高了的原因也无非是会有指针指向下一个节点的叶子节点。

小结：到这里可以总结出来，Mysql选用B+树这种数据结构作为索引，可以提高查询索引时的磁盘IO效率，并且可以提高范围查询的效率，并且B+树里的元素也是有序的。

那么，一个B+树的节点中到底存多少个元素最合适你有了解过么？

额这个这个？卧*有点懵逼呀。

过了一会还是没想出，只能老实交代：这个不是很了解咳咳。

你可以换个角度来思考B+树中一个节点到底多大合适？

B+树中一个节点为一页或页的倍数最为合适。

为啥？

因为如果一个节点的大小小于1页，那么读取这个节点的时候其实也会读出1页，造成资源的浪费。

如果一个节点的大小大于1页，比如1.2页，那么读取这个节点的时候会读出2页，也会造成资源的浪费。

所以为了不造成浪费，所以最后把一个节点的大小控制在1页、2页、3页、4页等倍数页大小最为合适。

你提到了页的概念，能跟我简单说一下么？

首先Mysql的基本存储结构是页(记录都存在页里边)：

Image
https://mmbiz.qpic.cn/mmbiz_jpg/uChmeeX1FpwUFWcYd1A97ia8Fde0dgBM8USmoGPaPHG3OGFRbAricpEvvnp6jXXhL9JW2Y4vzNHViaNXkgqvSzPXg/640?wx_fmt=jpeg&wxfrom=5&wx_lazy=1&wx_co=1

Image
各个数据页可以组成一个双向链表
而每个数据页中的记录又可以组成一个单向链表
- 每个数据页都会为存储在它里边儿的记录生成一个页目录，在通过主键查找某条记录的时候可以在页目录中使用二分法快速定位到对应的槽，然后再遍历该槽对应分组中的记录即可快速找到指定的记录
  以其他列(非主键)作为搜索条件：只能从最小记录开始依次遍历单链表中的每条记录。
  所以说，如果我们写 select * from user where username='丙丙'这样没有进行任何优化的sql语句，默认会这样做：

定位到记录所在的页
- 需要遍历双向链表，找到所在的页
  从所在的页内中查找相应的记录
- 由于不是根据主键查询，只能遍历所在页的单链表了