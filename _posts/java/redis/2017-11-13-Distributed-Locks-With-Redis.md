---
layout: page

title: 使用Redis实现分布式锁
category: redis
categoryStr: redis
tags: [redis,distributed,lock,DLM]
keywords: [redis,distributed,lock,Redlock,DLM]
description: 
---

<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. 使用Redis实现分布式锁</a>
<ul>
<li><a href="#sec-1-1">1.1. 安全性和活性(Liveness)保证</a></li>
<li><a href="#sec-1-2">1.2. Redis单节点实现</a>
<ul>
<li><a href="#sec-1-2-1">1.2.1. 租约机制</a></li>
<li><a href="#sec-1-2-2">1.2.2. 唯一值的生成</a></li>
<li><a href="#sec-1-2-3">1.2.3. 单实例主从Redis的问题</a></li>
</ul>
</li>
<li><a href="#sec-1-3">1.3. Redis分布式集群实现锁 Redlock</a>
<ul>
<li><a href="#sec-1-3-1">1.3.1. Redis锁考虑性能，故障恢复和fsync</a></li>
</ul>
</li>
<li><a href="#sec-1-4">1.4. java实现Redis锁</a>
<ul>
<li><a href="#sec-1-4-1">1.4.1. Redis单节点锁 java实现</a></li>
<li><a href="#sec-1-4-2">1.4.2. Reids集群多节点锁 java实现</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>



本文是看Reids官方文档之后所做的笔记，加上一点自己的想法和java实现Reids分布式锁的代码。  
详细具体的代码，可以见github： [redis-distributed-lock](https://github.com/songxin1990/redis-distributed-lock)

## 安全性和活性(Liveness)保证<a id="sec-1-1" name="sec-1-1"></a>

要实现分布式锁，要满足以下的几个条件属性：  
1. 安全性  
资源的访问安全性，也就是资源互斥，任何时间，有且仅有一个客户端持有锁并且能访问资源
2. 活性A  
无死锁，任何客户端最终总能获取到锁，即使是持有锁的客户端A崩溃了，客户端B也能继续获取
3. 活性B  
容错性，当集群大多数节点存活时，客户端就能获取到锁并进行释放

## Redis单节点实现<a id="sec-1-2" name="sec-1-2"></a>

使用Redis加锁资源最简单方式就是：生成一个与资源对应的有失效时间的唯一key，这个key就是锁。  
每次访问此资源之前，先判断key是否存在，如果存在，就说明已经被其他客户端加锁了；  
如果不存在，那么就生成此key，也就是对资源加锁，生成的客户端就持有锁。  

这里要注意的是：判断是否有key，没有就生成，这两步操作必须保证是一个原子性操作，  
这里就要使用到Redis的NX命令，具体语法如下：  
SET resource_name my_random_value NX PX 30000

下面详细解释下：  
resource_name：  
要加锁的资源  
NX：  
NX的语义是：如果不存在此key，就生成并设置一个；如果有，就什么都不做。NX保证这两步是一个原子操作。  

PX 30000  
设置30000毫秒的超时时间，到期key自动移除（expire）。  
这是为了避免以下场景会造成死锁：  
客户端A在master中获取到锁，但在执行过程中，程序直接挂掉，这样锁就永远不会释放。  
（不是发生异常，发生异常可以try catch后在finally中释放）  

my_random_value:  
生成的锁（也就是key）对应的一个随机值， 这个值必须在所有客户端和所有锁请求中是唯一的。  

之所以要设置这个值，我们可以先来考虑以下场景：  
1.  客户端A在master中获取到了锁并设置了超时时间  
2.  A持有锁期间对资源进行读写操作，完成后直接发送删除key命令，也就是释放掉锁  

在步骤2，有可能出现的情况是：在读写操作期间，这个key自动失效了，也就是过了超时时间，自动被Redis的失效机制给移除了。  
此时客户端B获取到了这个锁，但是A直接发送删除命令过来，将这个key给删除掉了，也就是A释放掉了B生成的锁。  

所以，正确的操作是：  
在A发送删除key命令，释放锁之前，先判断值是否是A自己设置。因此这个锁对应的值就必须唯一。  
如果是，那么A释放锁；如果不是，A直接忽略。  

### 租约机制<a id="sec-1-2-1" name="sec-1-2-1"></a>

这里还涉及到一个问题，就是：超时时间如何设置？  
设置的太短，资源读写还没完成，锁就自动释放了；  
设置的时间太长，会阻塞其他请求锁的客户端，性能降低。  
还有就是不同客户端的操作，耗时可能都不一样，甚至同一个客户端同一个操作，耗时都不一样，比如定时任务。  

这里就要用到租约机制，我看了[Google Paper](/bigdata/Google-Paper-GFS.html)，大概实现是：  
当过了50%的超时时间，客户端再次请求刷新失效时间，如果失败，在80%的时候，再次续约。  

### 唯一值的生成<a id="sec-1-2-2" name="sec-1-2-2"></a>

1. 使用RC4种子生成
2. 使用unix毫秒时间戳，加客户端ID

### 单实例主从Redis的问题<a id="sec-1-2-3" name="sec-1-2-3"></a>

Redis主从架构会有单点故障的问题，因为主从之间的复制是异步的。  
下面举一个有明显竞争条件的例子：  
1.  客户端A在master中获取到锁
2.  master在key复制到slave的过程中挂掉
3.  slave被提升为master，锁对应的key丢失
4.  客户端B请求新的master，获取到同一资源的锁

这样就违背了资源访问互斥条件，也即安全性。

## Redis分布式集群实现锁 Redlock<a id="sec-1-3" name="sec-1-3"></a>

现假设有5个Reids master实例，并且相互独立，也没使用复制机制。  

为了获取锁，客户端需要执行以下操作：  
1.  获取当前时间T1，毫秒级
2.  依次从5个实例顺序获取锁，使用相同的key和相同的随机value。
    对每个实例获取锁时，都要设置网络超时时间，避免长时间阻塞，超过了设置的锁释放时间E1。
    实例不可用或网络超时，立马换到下一个。
3.  客户端计算获取锁总的耗费时间Cost1，
    当且仅当客户端拿到一半以上的锁数量（这里最少为3），并且Cost1小于锁的释放时间E1，才认为锁获取成功。
4.  锁的真实有效性时间等于E1-Cost1，也就是执行任务真正能用的时间
5.  如果获取锁失败，比如数量小于一半，或者锁的有效性时间为负数，客户端尝试释放所有锁。
    当客户端获取锁失败后，可以在一段随机时间之后重新开始尝试获取锁。

### Redis锁考虑性能，故障恢复和fsync<a id="sec-1-3-1" name="sec-1-3-1"></a>

获取锁时，发送到多个Redis节点的请求，可以使用多路复用（multipleing）技术，减少串行发送耗费的RTT时间。  

考虑一个场景：  
客户端A获取到3个锁，但是其中一个有锁的实例挂掉了，而我们没有用持久化机制， 
重启后，客户端B从这个实例上获取到了一个锁，加上另外2个实例的锁，  
这样就违反了资源访问的互斥条件。  

如果使用了AOF持久化，会有一点改善。但是如果发生了断电，依然会丢失这个锁操作。  
可以将fsync设置为always，但是这会大大损失性能。  

## java实现Redis锁<a id="sec-1-4" name="sec-1-4"></a>

           package com.song.redis;
    
    import redis.clients.jedis.Jedis;
    
    import java.util.ArrayList;
    import java.util.Collections;
    import java.util.List;
    
    public class JedisUtils {
    
        public static Jedis getNewInstance(String host, int port, String password) {
            Jedis jedis = new Jedis(host, port);
            String authResult = jedis.auth(password);
            System.out.println("auth result:" + authResult);
            jedis.connect();
            jedis.select(8);
            return jedis;
        }
    
        /**
         * @param key
         * @param value
         * @param timeout milliseconds
         * @return
         */
        public static boolean lock(Jedis jedis, String key, String value, long timeout) {
            return jedis.setnx(key, value) == 1 ? jedis.pexpire(key, timeout) == 1 : false;
        }
    
        public static void releaseLock(Jedis jedis, String key, String value) {
            if (value.equals(jedis.get(key))) {
                jedis.del(key);
            }
        }
    
        public static String getRandomString() {
            return new StringBuilder().append(System.currentTimeMillis()).append(Thread.currentThread().getId()).toString();
        }
    
        public static List<Jedis> distributedLock(List<Jedis> jedisList, String key, String value, long timeout, long executionTime) {
            long t1 = System.currentTimeMillis();
            List<Jedis> acquiredLockJedis = new ArrayList<Jedis>();
            for (Jedis jedis : jedisList) {
                boolean lockResult = JedisUtils.lock(jedis, key, value, timeout);
                if (lockResult) {
                    acquiredLockJedis.add(jedis);
                }
            }
            long t2 = System.currentTimeMillis();
            long acquireLocksExpireTime = t2 - t1;
            //要减去pc的时间差，还要减去一个获取锁的耗费时间，得到最终有效时间
            //有效事件必须大于任务执行完成的时间，才认为获取锁有效
            long validityTime = timeout - 500 - acquireLocksExpireTime;
            if (validityTime > executionTime && acquiredLockJedis.size() >= jedisList.size() / 2 + 1) {//获取锁成功
                return acquiredLockJedis;
            } else {
                releaseDistributedLock(acquiredLockJedis, key, value);
                return Collections.emptyList();
            }
        }
    
        /**
         * 其实不需要返回值，是自己设置的value就删除key，释放锁；不是自己设置的，就忽略掉
         *
         * @param jedisList
         * @param key
         * @param value
         */
        public static void releaseDistributedLock(List<Jedis> jedisList, String key, String value) {
            for (Jedis jedis : jedisList) {
                releaseLock(jedis, key, value);
            }
        }
    }

### Redis单节点锁 java实现<a id="sec-1-4-1" name="sec-1-4-1"></a>

        package com.song.redis;
    
    import org.junit.Assert;
    import redis.clients.jedis.Jedis;
    
    public class SimpleLockExecutionThread extends Thread {
        private int i;
        private String host;
        private int port;
        private String password;
    
        public SimpleLockExecutionThread() {
    
        }
    
        public SimpleLockExecutionThread(String host, int port, String password, int i) {
            this.host = host;
            this.port = port;
            this.password = password;
            this.i = i;
        }
    
        public void run() {
            Jedis jedis = JedisUtils.getNewInstance(host, port, password);
            while (true) {
                String resourceName = "resourceLock";
                String uniqVal = JedisUtils.getRandomString();
                try {
                    boolean success = JedisUtils.lock(jedis, resourceName, uniqVal, 10000);
                    //do something,such as jdbc,read file etc.
                    if (success) {
                        execution();
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    JedisUtils.releaseLock(jedis, resourceName, uniqVal);
                }
                justSleep(1000);
            }
        }
    
        protected void execution() {
            final int k = i;
            for (int j = 0; j < 100; j++) {
                i++;
            }
            //我们以此验证对i的操作是安全的
            Assert.assertTrue(i == k + 100);
        }
    
        protected void justSleep(int i) {
            try {
                Thread.sleep(1000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
        }
    }

### Reids集群多节点锁 java实现<a id="sec-1-4-2" name="sec-1-4-2"></a>

          package com.song.redis;
    
    import redis.clients.jedis.Jedis;
    
    import java.util.ArrayList;
    import java.util.List;
    
    public class DistributedLockExecutionThread extends SimpleLockExecutionThread {
        private String host;
        private int port;
        private String password;
    
        private int i;
    
        public DistributedLockExecutionThread(String host, int port, String password, int i) {
            super(host,port,password,i);
            this.host = host;
            this.port = port;
            this.password = password;
            this.i = i;
        }
    
        @Override
        public void run() {
            List<Jedis> jedisList = new ArrayList<Jedis>();
            for (int i = 0; i < 5; i++) {
                Jedis jedis = JedisUtils.getNewInstance(host, port + i, password);
                jedisList.add(jedis);
            }
            while (true) {
                String resourceName = "resourceLock";
                String uniqVal = JedisUtils.getRandomString();
    
                long timeout = 10000;//释放锁时间
                long executionTime = 8000;
                List<Jedis> acquiredLockJedis = JedisUtils.distributedLock(jedisList, resourceName, uniqVal, timeout,executionTime);
                if (acquiredLockJedis == null || acquiredLockJedis.isEmpty()) {
                    //retry();  //获取锁失败时，等待一段时间后进行尝试。
                } else {
                    //do something
                    super.execution();
                }
                justSleep(1000);
            }
        }
    }

### 参考资料和扩展阅读  
[Distributed locks with Redis](https://redis.io/topics/distlock)  
[Redisson Distributed locks](https://github.com/redisson/redisson/wiki/8.-Distributed-locks-and-synchronizers)  