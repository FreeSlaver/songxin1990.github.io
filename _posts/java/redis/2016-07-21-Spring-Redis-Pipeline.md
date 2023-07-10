---
layout: page

title: Spring Redis pipeline的java代码实现
category: redis
categoryStr: redis
tags: Redis
keywords: 
description: 
---


下面写一个在Spring dataredis中实现pipeline的工具方法。使得redis可以一次性执行多个命令请求，类似数据库的batch。

### 实现代码pipeline

```

public List<V> pipeline( final List<K> keys) {
           RedisSerializer<K> keySerializer = (RedisSerializer <K>) redisTemplate.getKeySerializer();
           RedisSerializer<V> valueSerializer = (RedisSerializer <V>) redisTemplate.getValueSerializer();

          RedisCallback<List<Object>> pipelineCallback = new RedisCallback<List<Object>>() {
               @Override
               public List<Object> doInRedis(RedisConnection connection ) throws DataAccessException {
                    connection .openPipeline();
                    for (K k : keys ) {
                         final byte [] rawKey = keySerializer .serialize(k );
                         connection .get(rawKey );
                   }
                    return connection .closePipeline();
              }
          };

          List<Object> list = redisTemplate .execute(pipelineCallback );
          List<V> resultList = new ArrayList<>();
          for (Object obj : list ) {
               byte [] rawVal = ( byte[]) obj;
               V v = valueSerializer .deserialize(rawVal );
               resultList .add(v );
          }
          return resultList ;
   
}
     
```

###　测试用例:

```

@RunWith (SpringJUnit4ClassRunner. class)
@ContextConfiguration ({ "classpath:applicationContext.xml" })
public class RedisServiceTest {
	@Autowired
	RedisService<String, String> redisService ;

	@Test
	public void pipelineTest(){
	   redisService .put("518888A001" , "001" );
	   redisService .put("518888A002" , "002" );
	   List<String> keyList= new ArrayList<String>();
	   keyList.add( "518888A001" );
	   keyList.add( "518888A002" );
	  
	   List<String> result = redisService .pipeline(keyList );
	   System. out .println(result .toString());
	}
}

```

