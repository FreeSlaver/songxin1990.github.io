---
layout: page

title: Google论文之MapReduce详解
category: distribute
categoryStr: 分布式
tags: paper 大数据
keywords: MapReduce google 大数据
description: Google的MapReduce论文，赶里面重点地方做个翻译，做些笔记。
---

<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. MapReduce: Simplified Data Processing on Large Clusters</a>
<ul>
<li><a href="#sec-1-1">1.1. Abstract</a></li>
<li><a href="#sec-1-2">1.2. 1 Introduction</a></li>
<li><a href="#sec-1-3">1.3. Programming Model</a>
<ul>
<li><a href="#sec-1-3-1">1.3.1. 2.3 More Examples</a></li>
</ul>
</li>
<li><a href="#sec-1-4">1.4. 3 Implementation</a>
<ul>
<li><a href="#sec-1-4-1">1.4.1. 3.1 Execution Overview</a></li>
<li><a href="#sec-1-4-2">1.4.2. 3.2 Master Data Structures</a></li>
<li><a href="#sec-1-4-3">1.4.3. 3.3 Fault Tolerance</a></li>
</ul>
</li>
<li><a href="#sec-1-5">1.5. 4 Refinements 优化改进</a>
<ul>
<li><a href="#sec-1-5-1">1.5.1. 4.3 Combiner Function 组合器优化改进</a></li>
</ul>
</li>
<li><a href="#sec-1-6">1.6. 5 Performance</a>
<ul>
<li><a href="#sec-1-6-1">1.6.1. 5.2 Grep</a></li>
</ul>
</li>
<li><a href="#sec-1-7">1.7. 6 Experience</a>
<ul>
<li><a href="#sec-1-7-1">1.7.1. 6.1 Large-Scale Indexing 大规模索引</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>


# MapReduce: Simplified Data Processing on Large Clusters<a id="sec-1" name="sec-1"></a>

## Abstract<a id="sec-1-1" name="sec-1-1"></a>

Users specify a map function that processes a
key/value pair to generate a set of intermediate key/value
pairs, and a reduce function that merges all intermediate
values associated with the same intermediate key  
用户指定一个Map函数用于处理KV键值对，生成一系列的中间结果KV键值对，
一个Reduce函数对中间结果中相同的K值，进行V值合并。

The run-time system takes care of the
details of partitioning the input data, scheduling the program’s
execution across a set of machines, handling machine
failures, and managing the required inter-machine communication  
运行间系统会关注以下细节：输入数据分区，程序执行任务调度，处理集群中机器宕机，
处理集群间机器的通信。

## 1 Introduction<a id="sec-1-2" name="sec-1-2"></a>

The issues of how to parallelize
the computation, distribute the data, and handle
failures conspire to obscure the original simple computation
with large amounts of complex code to deal with these issues.  
如何并行计算，分发数据，处理因为大量复杂代码导致的错误。

hides the messy details
of parallelization, fault-tolerance, data distribution
and load balancing in a library  
MapReduce库隐藏了大量的细节，包括并行化，容错，数据分发，负载均衡等。

Our abstraction is inspired
by the map and reduce primitives present in Lisp
and many other functional languages  
我们的抽象是被List和其他很多函数语言中的Map和Reduce基元。

We realized that
most of our computations involved applying a map operation
to each logical “record” in our input in order to
compute a set of intermediate key/value pairs, and then
applying a reduce operation to all the values that shared
the same key, in order to combine the derived data appropriately  
我们意识到，绝大多数的计算操作可以用Map函数作用在输入数据的每一个逻辑记录上，
以此得到一系列的中间KV键值对。然后使用Reduce函数聚合所有相同K的V值。

Our use of a functional model with user specified
map and reduce operations allows us to parallelize
large computations easily and to use re-execution
as the primary mechanism for fault tolerance.  
使用函数模型，让用户编写Map和Reduce，让我们能够
轻易的大量并行化，并使用重新运算作为主要的容错机制。

## Programming Model<a id="sec-1-3" name="sec-1-3"></a>

Map, written by the user, takes an input pair and produces
a set of intermediate key/value pairs. The MapReduce
library groups together all intermediate values associated
with the same intermediate key I and passes them
to the Reduce function.  
Map函数，用户写的，接收KV的输入，输出中间的KV。
然后将相同K的所有V聚合起来，传递给Reduce函数。

The Reduce function, also written by the user, accepts
an intermediate key I and a set of values for that key. It
merges together these values to form a possibly smaller
set of values. Typically just zero or one output value is
produced per Reduce invocation  
Reduce函数，也是用户写的，接收中间结果的Key I和对应的值集合。
它合并这些值集合得到更小的集合。每次Reduce调用一般只有零个或者一个输出。

### 2.3 More Examples<a id="sec-1-3-1" name="sec-1-3-1"></a>

Distributed Grep：  
这个的话可以用于分布式日志查找。

Reverse Web-Link Graph：  
这个的功能相当于用Google搜索的link:，查找引用了指定URL的页面。  
结合到我们目前的标签项目，就是比如：给定了一个用户，我们汇集这个用户的全部相关属性。

Term-Vector per Host: 主机检索词向量  
统计一个或多个文档中出现的最频繁的词汇，也就是最重要的词汇。  
hostname : term-vector。hostname就是文档的URL。  
这个场景就是可以用来做个性化推荐之类的。  

Inverted Index：倒排索引  
Map函数输出word : documentId  
Reduce函数输出word : list（documentId）  
这样就实现了一个非常简单的倒排索引。用于搜索。  

Distributed Sort: 分布式排序  

## 3 Implementation<a id="sec-1-4" name="sec-1-4"></a>

The file system uses replication to
provide availability and reliability on top of unreliable hardware.  
文件系统使用复制保证在不可靠的硬件上的文件可用性和可靠性。

Users submit jobs to a scheduling system. Each job
consists of a set of tasks, and is mapped by the scheduler
to a set of available machines within a cluster.  
用户提交工作给调度系统。每个工作包含一系列的任务，并被调度系统  
映射到集群中一系列可用的机器上面。

### 3.1 Execution Overview<a id="sec-1-4-1" name="sec-1-4-1"></a>

Reduce invocations
are distributed by partitioning the intermediate key
space into R pieces using a partitioning function (e.g.,
hash(key) mod R)  
Reduce调用通过分割中间K到R份（比如取模）进行分发。

执行流程概述：  
1. 用户程序中的MapReduce库首先将输入文件切分为M份，一般是16到64M。
然后启动集群机器上的拷贝程序。
2. Master选择空闲可用的机器，并将Map任务或者Reduce任务分配给workers。
3. 分配了Map任务的worker读取相应的切分后的输入数据。它解析出KV键值对，并将每条记录
传递给用户定义的Map函数。产生的中间结果KV键值对缓存在内存中。
4. 缓冲会定期写到本地磁盘中，通过分区函数分发到R个区域中。
存放地址会被传回给master，然后由master告知分配了Reduce任务的worker。
5. 当Reduce worker被Master告知地址，就会远程读取中间结果数据。
当读取完所有中间数据，根据K对中间结果进行排序，并分组。
这样相同K值的就会分组到一组了。排序是必要的，如果排序后结果还是太大，要使用外部排序。
6. Reduce worker遍历有顺序的中间数据，对遇到的每个唯一的K，
它将K和相应的V结果集传递给Reduce函数。并将最终结果输出到对应的分区。
7. 当所有Map和Reduce任务执行完毕后，唤醒用户程序，并返回结果。

Typically, users do not need to combine these R output
files into one file – they often pass these files as input to
another MapReduce call, or use them from another distributed
application that is able to deal with input that is
partitioned into multiple files.  
一般，用户不需要合并这些R输出——它们经常被传递并作为另外的MapReduce的输入，  
或被另外的分布式应用使用。

### 3.2 Master Data Structures<a id="sec-1-4-2" name="sec-1-4-2"></a>

The master keeps several data structures. For each map
task and reduce task, it stores the state (idle, in-progress,
or completed), and the identity of the worker machine
(for non-idle tasks)  
Master保存一些数据结构。对于每个Map和Reduce任务，存储状态（  
空闲，进行中，完成），以及worker机器的标示。  
master也会广播并保存中间结果地址。  

### 3.3 Fault Tolerance<a id="sec-1-4-3" name="sec-1-4-3"></a>

1.  Worker Failure

    The master pings every worker periodically. 
    Any map tasks completed by the worker are reset back to their initial
    idle state, and therefore become eligible for scheduling
    on other workers.  
    通过Master对worker的ping来探活。  
    任何挂掉机器上的Map任务都会被重置，以便调度系统重新分配。  
    
    Completed map tasks are re-executed on a failure because
    their output is stored on the local disk(s) of the
    failed machine and is therefore inaccessible.  
    故障机器上已完成的Map任务会被重新执行，因为它们的输出保存在  
    本地，因此不可访问。  
    所有被重新执行的Map任务会被通知到Reduce worker，还未读取中间结果的会更新地址。  
    这点我觉得不太好，应该可以存在一个远程，集中的地方。  
    
    Completed reduce tasks do not need to be re-executed since their
    output is stored in a global file system.  
    已完成的Reduce任务无需重新执行，因为它们的结果保存在全局文件系统中。

2.  Master Failure

    It is easy to make the master write periodic checkpoints
    of the master data structures described above.  
    Master定期写数据结构的检查点到磁盘很容易。
    
    If the master task dies, a new copy can be started from the last
    checkpointed state.  
    如果Master挂掉，会从最后一个检查点生成新的拷贝并启动。

## 4 Refinements 优化改进<a id="sec-1-5" name="sec-1-5"></a>

### 4.3 Combiner Function 组合器优化改进<a id="sec-1-5-1" name="sec-1-5-1"></a>

Combiner function that does partial merging of
this data before it is sent over the network.  
组合器函数会局部合并数据，然后通过网络发送出去。

When a MapReduce operation is close
to completion, the master schedules backup executions  
of the remaining in-progress tasks. The task is marked
as completed whenever either the primary or the backup
execution completes.  
当MapReduce操作快完成时，调度系统会备份还在执行中的任务。  
当备份或者原始任务之一完成，此任务就被标记为完成。  
这是为了应对部分最后阶段的“游荡”任务。  

The only difference between a reduce function and
a combiner function is how the MapReduce library handles
the output of the function  
Reduce函数和组合函数唯一的区别是对输出的处理。

## 5 Performance<a id="sec-1-6" name="sec-1-6"></a>

### 5.2 Grep<a id="sec-1-6-1" name="sec-1-6-1"></a>

The overhead is due to the propagation of the program
to all worker machines, and delays interacting with  
GFS to open the set of 1000 input files and to get the
information needed for the locality optimization.   
性能的天花板在于：传播程序到所有的worker机器是，和GFS交互时打开1000个文件，
获取本地优化需要的相关信息。

## 6 Experience<a id="sec-1-7" name="sec-1-7"></a>

MapReduce应用领域：  
- large-scale machine learning problems,  
大规模的机器学习问题
- clustering problems for the Google News and
Froogle products,  
Google新闻和购物搜索产品的集群问题
- extraction of data used to produce reports of popular
queries (e.g. Google Zeitgeist),  
从普遍的查询中提取数据产生报告
- extraction of properties of web pages for new experiments and products  
(e.g. extraction of geographical locations from a large corpus of web pages for localized search), and  
提取页面属性以用于新的实验和产品。（比如从大量的web页面中提取地理位置用于局部搜索）
- large-scale graph computations  
大规模图片运算

### 6.1 Large-Scale Indexing 大规模索引<a id="sec-1-7-1" name="sec-1-7-1"></a>

The performance of the MapReduce library is good enough that we can keep conceptually unrelated  
computations separate, instead of mixing them together to avoid extra passes over the data.   
This makes it easy to change the indexing process.  
MapReduce的性能很好，所以我们能将无关的计算分开。
而不是为了避免数据传输和混杂在一起。这让改变建立索引过程很容易。
