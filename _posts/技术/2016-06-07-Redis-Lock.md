---
layout: post
title: Redis实现锁
category: 技术
tags: lock
keywords: 
description: 
---

最近做公司项目，E栈的，遇到一个箱格分配的问题。

### 业务场景：

有一个终端，上面有很多个箱格，当高并发请求的时候，如何保证分配的箱格不冲突。需要使用到Redis的setNx方法。setNx(key,val)，它作用是判断key（也就是锁）是否存在，如果不存在则创建，返回成功，如果存在则返回失败。这个key就代表我们的终端，这样就能保证此终端在箱格分配是安全的。

使用的是RedisService是使用的Spring的DataRedis，RedisTemplate，不是Jedis。要实现的就2个方法，一个加锁操作，一个释放锁操作。代码如下：

### 代码实现：

````

public boolean lock(K key , V value , final long expire) {
	
	RedisSerializer<K> keySerializer = (RedisSerializer<K>) redisTemplate.getKeySerializer() ;
	byte[] keys = keySerializer .serialize(key);
	RedisSerializer<V> valueSerializer = (RedisSerializer<V>) redisTemplate.getValueSerializer() ;
	byte[] values = valueSerializer.serialize(value );
	boolean result = redisTemplate.getConnectionFactory().getConnection().setNX(keys, values);
	if(result ){
		redisTemplate.expire(key , expire , TimeUnit.SECONDS );
	}
	return result ;
}

public void unLock(K key ) {
	if (key != null) {
		redisTemplate.delete(key );
	}
}

````

还有一种方式是redis中设置一个Long型的key,每次lock的时候，对key加1，如果返回key的值是1，说明加锁成功，大于1，加锁失败，将key的值减去1，释放锁的时候对key减1，使用redis的getAndIncresment方法。

当然如果功能需求复杂点，可能需要实现tryLock之类的，具体参见如下：

浅析Redis实现lock互斥访问资源
http://www.2cto.com/database/201412/365353.html

Redis实现分布式锁
http://blog.csdn.net/java2000_wl/article/details/8740911


### 后续跟新

上面的方法会造成redis死锁，我想应该是每次获取连接之后没有释放之类的。具体原因我来看看源码。改进后的代码：

```

public boolean setNX(final K key, final V value) {
	return redisTemplate.execute(new RedisCallback<Boolean>() {
		@SuppressWarnings("unchecked")
		public Boolean doInRedis(RedisConnection connection) throws DataAccessException {
			RedisSerializer<K> keySerializer = (RedisSerializer<K>) redisTemplate.getKeySerializer();
			byte[] keys = keySerializer.serialize(key);
			RedisSerializer<V> valueSerializer = (RedisSerializer<V>) redisTemplate.getValueSerializer();
			byte[] values = valueSerializer.serialize(value);
			return connection.setNX(keys, values);
		}
	});
}


public boolean tryLock(K key, V value, final long expire, final long timeout, TimeUnit unit) {
	long nano = System.nanoTime();
	do {
		boolean result = setNX(key, value);
		if (result) {
			redisTemplate.expire(key, expire, TimeUnit.SECONDS);
			return true;
		}
		if (timeout == 0) {
			break;
		}
		try {
			Thread.sleep(300);
		} catch (InterruptedException e) {
			logger.error(e.getMessage(), e);
		}
	} while ((System.nanoTime() - nano) < unit.toNanos(timeout));
	return false;
}

```




















