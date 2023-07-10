---
layout: page

title: 关于Redis keys命令
category: redis
categoryStr: redis
tags: [redis,redis keys,command]
keywords: [redis,redis keys,command]
description: 
---

Redis中的keys是一个提供模糊匹配查询的功能命令。例子：

```

KEYS h?llo 匹配 hello ， hallo 和 hxllo 等。
KEYS h*llo 匹配 hllo 和 heeeeello 等。
KEYS h[ae]llo 匹配 hello 和 hallo ，但不匹配 hillo 。

```

但是这个命令会造成一定问题，官方文档说明如下：

Warning: consider KEYS as a command that should only be used in production environments with extreme care. It may ruin performance when it is executed against large databases. This command is intended for debugging and special operations, such as changing your keyspace layout. Don’t use KEYS in your regular application code. If you’re looking for a way to find keys in a subset of your keyspace, consider using SCAN or sets.

大意是：在生产环境使用需要极度小心。在面对大量数据时，会严重影响性能。一般用作debug或者特殊操作，比如改变你的key空间布局（?）。不要在你代码中使用。使用SCAN或者Sets代替它。

使用SCAN或者Sets好像是将所有可能的Key放在一个集合中，然后调用SCAN或者Sets命令。

网上的一些说法如下：Keys会引发Redis锁，并且增加Redis的CPU占用。

### 存储大量redis key的解决方案

1.key的命名要规定，尽量简短，减少内存空间占用。

2.对key分批做索引，将这些key存到缓存的list里面，分批，例如，前100个key的list 就是 key:0:100 key:100:200 大概这样。

3.避免使用Redis的String数据结构，尽量使用hash，hash是支持压缩的。

### 一个实例：


SET media:1155315 939

GET media:1155315

我们可以将key值前面相同的media去掉，只存数字，这样key的长度就减少了，减少key值对内存的开销【注：Redis的key值不会做字符串到数字的转换，所以这里节省的，仅仅是media:这6个字节的开销】

HSET "mediabucket:1155" "1155315" "939"

HGET "mediabucket:1155" "1155315"

"mediabucket:1155"是key，后面的"1155315" "939"是一个Map的Val。
同样的，这里我们还是可以再进行优化，首先是将Hash结构的key值变成纯数字，这样key长度减少了12个字节，其次是将Hash结构中的subkey值变成三位数，这又减少了4个字节的开销

参考以下网址文章：
http://www.cnblogs.com/restran/p/4295184.html







