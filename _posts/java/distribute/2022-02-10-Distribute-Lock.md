---
layout: page

title: 分布式锁面试题及解决方案
category: distribute
categoryStr: 分布式
tags: book
keywords: java面试 redis
description: 
---


面试官：你有没有参与过秒杀系统的设计？
我：没有，我平时都是开发后台管理系统、OA办公系统、内部管理系统，从来没有开发过秒杀系统。
面试官：嗯...，小伙子很实诚。今天就先到这里吧，后面有消息会主动联系你。
后面还可能有消息吗？
你们啥时候主动联系过我？
实话实说的被拒，八股文背的溜反而被录取。 好吧，等我看看一灯怎么总结的秒杀系统的八股文。
我：参与过秒杀系统，并独立负责过秒杀系统的架构设计（【狗头】是的，都是我设计的）。
面试官：这样才对，这样我才能接着往下问。你在设计秒杀系统的时候，怎么防止商品超卖？比如活动中只有一台iPhone，最终卖出100台，肯定不行，平台要亏钱。
我：肯定要加锁，不过由于秒杀系统请求量较大，一般使用分布式集群。而Java自带Synchronized、ReentrantLock锁只能用在单机系统中，这时候就需要用到分布式锁。
面试官：你提到分布式锁，分布式锁都有哪些作用？
八股文这就开始了。
我：我觉得分布式锁主要有两个作用：
保证数据的正确性： 比如：秒杀的时候防止商品超卖，表单重复提交，接口幂等性。
避免重复处理数据： 比如：调度任务在多台机器重复执行，缓存过期所有请求都去加载数据库。
总结八股文，还得是一灯。
面试官：小伙子总结的挺全，你知道设计一个分布式锁，要具有哪些特性？
我：我觉得分布式锁要具有以下这些特性：

互斥：同一时刻只能有一个线程获得锁。
可重入：当一个线程获取锁后，还可以再次获取这个锁，避免死锁发生。
高可用：当小部分节点挂掉后，仍然能够对外提供服务。
高性能：要做到高并发、低延迟。
支持阻塞和非阻塞：Synchronized是阻塞的，ReentrantLock.tryLock()就是非阻塞的
支持公平锁和非公平锁：Synchronized是非公平锁，ReentrantLock(boolean fair)可以创建公平锁
面试官：小伙子，有点东西。你是怎么设计一个分布式锁？

我：有几种常用的工具都可以实现分布式锁。
比如：关系型数据库（例如：MySQL）、分布式数据库（例如：Redis）、分布式协调服务框架（例如：zookeeper）
使用MySQL实现分布式锁比较简单，建一张表：


CREATE TABLE `distributed_lock` (
`id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
`resource_name` varchar(200) NOT NULL DEFAULT '' COMMENT '资源名称（唯一索引）',
PRIMARY KEY (`id`),
UNIQUE KEY `uk_resource_name` (`resource_name`)) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='分布式锁';
获取锁的时候，就插入一条记录。插入成功就代表获取到锁，插入失败就代表获取锁失败。

INSERT INTO distributed_lock (`resource_name`) VALUES ('资源1');
释放锁的时候，就删除这条记录。

DELETE FROM distributed_lock WHERE resource_name = '资源1';
实现比较简单，不过还不能用于实际生产中，有几个问题没有解决：
1.
这把锁不支持阻塞，insert失败立即就返回了。当然可以用while循环直到插入成功，不过自旋也会占用CPU。
2.
这把锁不是可重入的，已经获取到锁的线程再次插入也会失败，我们可以增加两列，一列记录获取到锁的节点和线程，另一列记录加锁次数。获取锁，次数加一，释放锁，次数减一，次数为零就删除这把锁。
3.
这把锁没有过期时间，如果业务处理失败或者机器宕机，导致没有释放锁，锁就会一直存在，其他线程也无法获取到锁。我们可以增加一列锁过期时间，再启动一个异步任务扫描过期时间大于当前时间的锁就删除。


就是这么麻烦，我们看一下优化之后的锁变成什么样了：


CREATE TABLE `distributed_lock` (
`id` bigint unsigned NOT NULL AUTO_INCREMENT COMMENT '主键ID',
`resource_name` varchar(200) NOT NULL DEFAULT '' COMMENT '资源名称（唯一索引）',
`owner` varchar(200) NOT NULL DEFAULT '' COMMENT '锁持有者（机器码+线程名称）',
`lock_count` int NOT NULL DEFAULT '0' COMMENT '加锁次数',
`expire_time` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '锁过期时间',
PRIMARY KEY (`id`),
UNIQUE KEY `uk_resource_name` (`resource_name`)) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='分布式锁';
这下应该完美了吧？不行，还有个问题：
业务逻辑没处理完，锁过期了怎么办？
假如我们设置锁过期时间是6秒，正常情况下业务逻辑可以在6秒内处理完成，但是当JVM发生FullGC或者调用第三方服务出现网络延迟，业务逻辑还没处理完，锁已经过期，被删掉，然后被其他线程获取到锁，岂不是要出问题？
这就引入了另一个知识点“锁续期”：
获取锁的同时，启动一个异步任务，每当业务执行到三分之一时间，也就是6秒中的第2秒的时候，就自动延长锁过期时间，继续延长到6秒，这样就能保证业务逻辑处理完成之前锁不会过期。
面试官：小伙子，分布式锁算是让你玩明白了。我还想继续问，生产中一般很少用MySQL做分布式锁，因为MySQL并发性能跟不上。刚才提到Redis也可以实现分布式锁，你知道该怎么实现吗？
我当然知道，八股文就要背全套。
我：使用Redis实现分布式锁，跟使用MySQL类似，也需要解决实现过程中遇到的各种问题，不过解决方案稍有不同。
最简单的获取锁方式：

// 1. 获取锁redis.setnx('resource_name1', 'owner1')// 2. 释放锁redis.del('resource_name1')
当“resource_name1”不存在时，set成功，也就是获取锁成功。
不过还需要加上过期时间，防止没有释放锁。

// 1. 获取锁redis.setnx('resource_name1', 'owner1')// 2. 增加锁过期时间redis.exprire('resource_name1', 6, TimeUnit.SECONDS)
又引入新问题了，两条命令不是原子的，可能获取锁之后还没来得及设置过期时间就宕机了，这该怎么办？
好办，在Redis 2.6.12之后，提供一条复合命令：

redis.set('resource_name1', 'owner1',"NX" "EX", 6)
还有一个问题，释放锁的时候，并没有判断锁的持有者，有可能把其他线程持有的锁给释放了，这可不行，可以这样做：


// 释放锁if ('owner1'.equals(redis.get('resource_name1'))){
redis.del('resource_name1')}
这样行不行呢？还不行，因为get和del两条命令不是原子操作，需要引入Lua脚本把两条命令打包成一条发给Redis执行：

String script = "if redis.call('get', KEYS[1]) == ARGV[1] then return redis.call('del', KEYS[1]) else return 0 end";redis.eval(script, Collections.singletonList('resource_name1'), Collections.singletonList('owner1'))
这样总行了吧？还不行，还有个“锁续期”的问题没有解决。
更简单了，Redis客户端Redisson已经帮我们实现续期的功能，叫“WatchDog”（看门狗），在我们调用lock自动唤醒“看门狗”。
面试官：小伙子，你可真行啊。你再讲一下使用zookeeper怎么实现分布式锁？
我：zookeeper采用树形节点，类似Linux目录文件结构，同一目录下的节点名称不能重复。

<img src="/img/java/2022-02-10-Distribute-Lock-Zookeeper-Impl.jpg" class="post-img" alt="2022-02-10-Distribute-Lock-Zookeeper-Impl">

节点有分为四种类型：

持久节点：一旦创建，永久存储在服务器上，除非手动删除。
临时节点：生命周期与客户端绑定，客户端断开连接，节点就被自动删除。
持久顺序节点：特性同持久节点，只是在节点名称后面追加自增有序数字。
临时顺序节点：特性同临时节点，只是在节点名称后面追加自增有序数字。
zookeeper还有个监听-通知机制，客户端可以在资源节点上创建watch事件。当节点发生变化，会通知客户端，客户端可以根据变化做相应的业务处理。
我们可以利用临时顺序节点的特性创建分布式锁，分以下三步：
1.
在资源/resource1目录下创建临时顺序节点node
2.
获取/resource1目录下的所有节点，如果当前节点序号最小，代表加锁成功
3.
如果不是，就是watch监听序号最小的节点


实现逻辑很简单，我们来分析一下zookeeper实现分布式锁的优点：
1.
由于创建的临时节点，断开连接后自动删除，所以无需设置锁超时时间，也就不用考虑不释放和锁续期
2.
由于节点上存储的创建人信息，锁也就支持可重入
3.
由于可以监听节点，也就实现了可阻塞


总结，一图胜千言
<img src="/img/java/2022-02-10-Distribute-Lock-Summary.jpg" class="post-img" alt="2022-02-10-Distribute-Lock-Summary">


