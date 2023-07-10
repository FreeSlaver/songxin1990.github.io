---
layout: page

title: Activemq之KahaDB实现
category: distribute
categoryStr: 分布式
tags: MQ
keywords: 
description: 
---



大致翻译于《ActiveMQ in Action》
KahaDB 支持多种机制在系统异常关闭后重启并恢复。包括检测数据文件丢失和还原损坏的metadata。这些特性并不能完全保证系统异常关闭不造成消息丢失。如果需要保证系统的高可靠性，建议部署到容灾系统上。例如RAID磁盘阵列中。 

当broker正常关闭时， KahaDB message store会将所有的缓存数据刷到文件系统中。尤其是这些数据： 
1、所有未处理的日志数据 
2、所有缓存的metadata 
最后meta store中的信息与journal数据文件中的数据保持一致性。 

正常情况下，在系统恢复时优先读取journal中的数据。因为metacache中的索引信息是周期性的更新到meta store中的。当系统异常关闭时，可能journal中有的数据meta store中并没有不存在索引。但是KahaDB在恢复时会先读取meta store中的数据，然后再读取journal有但是meta store不存在的数据（因为KahaDB根据meta store中的索引信息快速定位到metastore没有但是journal文件中包含的数据，然后根据这些数据重新在meta store中建立索引信息） 

KahaDB会在更新metadata store之前，保存更新操作的概要信息到重做日志(db.redo)中。减少系统异常关闭时的风险。因为重做日志非常小，所以在系统异常关闭时能快速写入。当系统恢复时会判断重做日志中的信息是否需要更新到metadata中。 

如果 metadata store 已被不可挽回的损坏了，可以删除metadata store文件（db.data）来强制恢复；只不过这个时候，broker会读取所有的journal文件来重建metadata store，需要一段比较长的时间。 

KahaDB可以检测是否有journal文件丢失，如果有丢失，默认将会抛出一个异常然后关闭。便于管理员调查丢失的journal文件，并手动还原。可以通过设置ignoreMissingJournalfiles为true，让broker在启动时忽略这些丢失的journal文件。






内存中的消息，使用一个BTree存储索引然后存储到一个Redo Log中，将真正的消息存储在DataLogs中，

将BTree的索引和DataLogs映射起来

B-tree index的设计是为了更快的把消息从日志文件中恢复出来，它包含一个指向日志文件中消息存储的位置的指针。完整的B-tree index存储在磁盘上，并且部分B-tree index被加载到内存中的缓存里面。显而易见的是如果B-tree index被全部加在到缓存中的话，那么效率会更高。



