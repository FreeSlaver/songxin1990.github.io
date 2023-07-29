---
layout: page
breadcrumb: true
title: Activemq之Amq实现
category: trash
categoryStr: 废弃
tags: MQ
keywords: 
description: 
---




大致翻译于activemq in action
          

### 日志存放， 

存放日志，日志中记录消息，和命令，比如事务性界限和消息删除命令，日志文件一般都有最大长度，当达到最大长度的时候，就会新建一个文件。

所有存放的消息的数据文件都被指针指向（reference counted？），因此，当每一个在日志文件中的消息不被需要，数据文件就会被删除，或者归档。日志是在文件稳步添加消息的，所以非常的快。

### 内存：

它在持久化消息到日志文件中之后，依然持有消息，这是为了快速恢复。内存会定期更新索引存放，就是它的消息ID和消息存放在日志中的文件（也就是id作为key,日志存放在文件中的位置作为value），这就是checkpoint机制。当这个索引存放被更新之后，消息就可以被从内存中删除。这个更新索引的时间可以配置，也可以被checkpointInterval属性设置。当broker的内存满了的时候，这个checkpoint机制也会触发。

### 索引存放：

持有指向消息在日志中存放的位置，以消息id作为索引。实际上索引存放维持这个queue的FIFO数据结构，以及耐久的订阅者在主题消息中的位置。这个索引类型可以被设置，默认是使用hash index。它也可以使用in-memory的hashmap，但是仅仅在全部的消息数量在日志存放的地方少于1million,在任何时候。

这个索引不是BTree?

这样的话，还需要在broker中维持一个保存Map<MsgId,Position>的东西，消息id为key，消息在日志文件中保存的位置position为value的map。

还要持久化一个索引存放，也就是这个map



