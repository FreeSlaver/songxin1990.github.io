---
layout: page

title: Redis Expire键值失效机制
category: redis
categoryStr: redis
tags: [redis,expire,机制]
keywords: [redis,expire,机制]
description: 
---
<div id="table-of-contents">
<h2>Table of Contents</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Redis Expire键值失效机制</a>
<ul>
<li><a href="#sec-1-1">1.1. 语法</a></li>
<li><a href="#sec-1-2">1.2. Redis键值2种失效方式</a></li>
<li><a href="#sec-1-3">1.3. 应用场景</a></li>
<li><a href="#sec-1-4">1.4. 失效后副本处理</a></li>
<li><a href="#sec-1-5">1.5. 如何用Java实现类似Redis的失效机制</a></li>
<li><a href="#sec-1-6">1.6. Redis Expire源码解读 TODO</a></li>
<li><a href="#sec-1-7">1.7. 参考资料和扩展阅读</a></li>
</ul>
</li>
</ul>
</div>
</div>



## 语法<a id="sec-1-1" name="sec-1-1"></a>

EXPIRE mykey 10  
命令     目标键  时间毫秒  
也可以使用EXPIRE命令刷新失效时间。  
返回值：   1，成功；0，失败。  

使用PERSIST命令去掉失效设置。  

使用DEL,SET,GETSET,*STORE，那么失效时间会被清除。    
就是所有对value的修改动作，比如INCR,LPUSH.HSET等，都会导致expire命令的失效。  

## Redis键值2种失效方式<a id="sec-1-2" name="sec-1-2"></a>

### 被动：  
当客户端尝试获取key时，发现key超时逾期了，然后删掉。  
但这不够，因为有些key可能永远不会被再次访问。  
这就要用到主动。  

### 主动：  
Redis每秒钟进行10次的定时检查，从要失效的key集合中随机抽取，  
1. 检验20个随机keys  
2. 删除发现已经逾期的  
3. 如果发现25%的keys已经逾期，重复步骤1   
4. 直到发现逾期的keys在25%以下，等待下一次检查   

## 应用场景<a id="sec-1-3" name="sec-1-3"></a>

可用来记录用户访问的页面  
```
MULTI  
RPUSH pagewviews.user:<userid> <http://>&#x2026;..
EXPIRE pagewviews.user:<userid> 60
EXEC
```
## 失效后副本处理<a id="sec-1-4" name="sec-1-4"></a>

当一个key失效后，一个DEL命令操作会被合成，并应用到AOF文件和所有的slavers上。

## 如何用Java实现类似Redis的失效机制<a id="sec-1-5" name="sec-1-5"></a>

    package com.song.saber.redis;
    
      public class CacheItem {
    
      private String key;
    
      private String value;
      //放入时间
      private long bornTime;
    
      private long timeout;
    
      public CacheItem() {
      }
    
      public CacheItem(String key, String value, long bornTime, long timeout) {
          this.key = key;
          this.value = value;
          this.bornTime = bornTime;
          this.timeout = timeout;
      }
    
      public String getKey() {
          return key;
      }
    
      public void setKey(String key) {
          this.key = key;
      }
    
      public String getValue() {
          return value;
      }
    
      public void setValue(String value) {
          this.value = value;
      }
    
      public long getBornTime() {
          return bornTime;
      }
    
      public void setBornTime(long bornTime) {
          this.bornTime = bornTime;
      }
    
      public long getTimeout() {
          return timeout;
      }
    
      public void setTimeout(long timeout) {
          this.timeout = timeout;
      }
    
      @Override
      public String toString() {
          return new StringBuilder().append("key:").append(key)
                  .append(",values:").append(value)
                  .append(",bornTime:").append(bornTime)
                  .append(",timeout:").append(timeout).toString();
      }
    }

     package com.song.saber.redis;
    
    import java.util.*;
    
    /**
     * Created by 00013708 on 2017/11/8.
     */
    public class InspectTask extends TimerTask {
        private static final int RANDOM_PICK_NUM = 20;
        private static final double EXPIRE_OVER_RATIO = 0.25;
        private static final int EXPIRE_OVER_NUM = (int) (RANDOM_PICK_NUM * EXPIRE_OVER_RATIO);
        private Map<String, CacheItem> cache;
    
        public InspectTask(Map<String, CacheItem> cache) {
            this.cache = cache;
        }
    
        public void run() {
            List<CacheItem> list = randomPick();
            int expiredNum = inspect(list);
            if (expiredNum >= EXPIRE_OVER_NUM) {
                run();
            }
        }
        private List<CacheItem> randomPick() {
            List<CacheItem> list = new ArrayList<CacheItem>(cache.values());
            Collections.shuffle(list);
            return list.subList(0, RANDOM_PICK_NUM);
        }
    
        private int inspect(List<CacheItem> randomPickedItems) {
            if (randomPickedItems == null || randomPickedItems.isEmpty()) {
                throw new IllegalArgumentException("cache items null");
            }
            Iterator<CacheItem> iterator = randomPickedItems.iterator();
            int expiredItemCounter = 0;
            while (iterator.hasNext()) {
                CacheItem item = iterator.next();
                if (hasExpired(item)) {
                    cache.remove(item.getKey());
                    System.out.println("key:" + item.getKey() + ",value:" + item.getValue() + ",expired!");
                    expiredItemCounter++;
                }
            }
            return expiredItemCounter;
        }
    
        private boolean hasExpired(CacheItem item) {
            if (item == null) {
                return false;
            }
            long bornTime = item.getBornTime();
            long timeout = item.getTimeout();
            long now = System.currentTimeMillis();
            if (now >= bornTime + timeout) {
                return true;
            } else {
                return false;
            }
        }
    
        public Map<String, CacheItem> getCache() {
            return cache;
        }
    
        public void setCache(Map<String, CacheItem> cache) {
            this.cache = cache;
        }
      }

          package com.song.saber.redis;
    
    import java.util.*;
    
    /**
     * java实现redis expire机制
     */
    public class RedisExpire {
        //redis中本来存的是byte[]，这里方便起见用对象
        private Map<String, CacheItem> cache;
    
        public RedisExpire() {
            this.cache = new HashMap<String, CacheItem>();
        }
        //简单处理，不考虑之前是否有此key
        public void expire(String key, String value, long timeout) {
            CacheItem item = new CacheItem(key, value, System.currentTimeMillis(), timeout);
            cache.put(key, item);
        }
        public static void main(String[] args) {
            final RedisExpire expire = new RedisExpire();
    
            Random random = new Random();
            //1.添加1千个值，超时时间设置在1000ms到10000ms之间
            for (int i = 0; i < 1000; i++) {
                String strI = String.valueOf(i);
                double next = random.nextDouble();
                long timeout = (long) (1000 + next * 9000);
                expire.expire(strI, strI, timeout);
            }
            System.out.println(expire.getCache().toString());
            //2.添加一个定时任务，检查过期项
            Timer t = new Timer();
            TimerTask task = new InspectTask(expire.getCache());
    
            t.scheduleAtFixedRate(task, 0, 1000);
        }
        public Map<String, CacheItem> getCache() {
            return cache;
        }
        public void setCache(Map<String, CacheItem> cache) {
            this.cache = cache;
        }
      }

## Redis Expire源码解读 TODO<a id="sec-1-6" name="sec-1-6"></a>

## 参考资料和扩展阅读<a id="sec-1-7" name="sec-1-7"></a>

[EXPIRE key seconds](https://redis.io/commands/expire)
