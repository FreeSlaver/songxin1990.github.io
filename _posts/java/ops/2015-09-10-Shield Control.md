---
layout: page

title: Shield权限控制
category: ops
categoryStr: 运维监控
tags: Shield Config
keywords: 
description: 
---


安装shiled之后，我们需要添加一些角色和用户。

打开elasticsearch/config/shield/roles.yml文件，一些简单的默认配置如下

```

// All cluster rights
//All operations on all indices
admin:
  cluster: all
  indices:
    '*': all

// Read-only operations on indices
user:
  indices:
    '*': read

```

我们不想让所有的用户接触到所有的分片，因此我们改变user.indices。

我们添加2个角色，医生和护士。医生有比护士更多indices.

护士仅仅可以接触case索引，并且只有读权限

```

//注释掉user的权限
// Read-only operations on indices
//user:
//  indices:
//    '*': read

// Doctors can access all indices
doctor:
  indices:
    '*': read

// Nurses can only access the cases index
nurse:
  indices:
    'nysyslogs': read

```

现在用户都被定义了，我们可以创建有这些权限的用户。

shield提供3个领域去保存用户：internal realm内部领域，LDAP或者Active Directory

从现在起，我们使用internal realm内部领域。

这个是配置在elasticsearch/config/elasticsearch.yml中。

如果没有特别的配置，那么默认使用internal realm。

使用esusers命令工具创建用户。

```

//添加一个alice的用户指向nurse这个群组
$ elasticsearch/bin/shield/esusers useradd alice -r nurse
$ elasticsearch/bin/shield/esusers useradd bob -r doctor

```

检验一下看是否起效果。

```

$ curl --user alice:abc123 localhost:9200/_count?pretty=true
{
  "count" : 5,
  "_shards" : {
    "total" : 1,
    "successful" : 1,
    "failed" : 0
  }
}
$ curl --user bob:abc123 localhost:9200/_count?pretty=true
{
  "count" : 10,
  "_shards" : {
    "total" : 2,
    "successful" : 2,
    "failed" : 0
  }
}

```
现在来添加kibana.下载并安装。

我们需要告诉shield，kibana是被允许接触到cluster的。

shield默认是配置了kibana的。角色定义在elasticsearch/config/shield/roles.yml.

```

// The required role for kibana 4 users
kibana4:
  cluster: cluster:monitor/nodes/info
  indices:
    '*':
      - indices:admin/mappings/fields/get
      - indices:admin/validate/query
      - indices:data/read/search
      - indices:data/read/msearch
      - indices:admin/get
    '.kibana':
      - indices:admin/exists
      - indices:admin/mapping/put
      - indices:admin/mappings/fields/get
      - indices:admin/refresh
      - indices:admin/validate/query
      - indices:data/read/get
      - indices:data/read/mget
      - indices:data/read/search
      - indices:data/write/delete
      - indices:data/write/index
      - indices:data/write/update

```
当kibana服务器启动的时候会去接触到.kibana后缀的索引。因此我们需要在shield中创建一个用户，让kibana连接上

$ elasticsearch/bin/shield/esusers useradd kibana -r kibana4

这个账户必须在kibana中配置，修改kibana/conf/kibana.yml文件。

```

//If your Elasticsearch is protected with basic auth, this is the user credentials
//used by the Kibana server to perform maintence on the kibana_index at statup. Your Kibana
// users will still need to authenticate with Elasticsearch (which is proxied thorugh
//the Kibana server)
kibana_elasticsearch_username: kibana
kibana_elasticsearch_password: abc123

```

这个kibana用户必须有kibana4的角色才能和kibana一起工作。他们必须保存他们的可视化和面板在.kibana的索引里面。

```

//添加用户alice到kibana4这个角色组里面。
$ elasticsearch/bin/shield/esusers roles alice -a kibana4
$ elasticsearch/bin/shield/esusers roles bob -a kibana4

```

因为默认的kibana4权限有读所有的indices的权限。所以alice和bob默认会接触到所有的indices.
因此这个角色权限必须被修改。

```

//Doctors can access all indices
doctor:
  indices:
    'cases,patients':
      - indices:admin/mappings/fields/get
      - indices:admin/validate/query
      - indices:data/read/search
      - indices:data/read/msearch
      - indices:admin/get





doctor:
  indices:
    '*':
      - indices:admin/mappings/fields/get
      - indices:admin/validate/query
      - indices:data/read/search
      - indices:data/read/msearch
      - indices:admin/get

//Nurses can only access the cases index
//nurses只有case索引的权限
nurse:
  indices:
    'cases':
      - indices:admin/mappings/fields/get
      - indices:admin/validate/query
      - indices:data/read/search
      - indices:data/read/msearch
      - indices:admin/get




nurse:
  indices:
    'nysyslogs':
      - indices:admin/mappings/fields/get
      - indices:admin/validate/query
      - indices:data/read/search
      - indices:data/read/msearch
      - indices:admin/get

// The required role for kibana 4 users
kibana4:
  cluster:
      - cluster:monitor/nodes/info
      - cluster:monitor/health
  indices:
    '.kibana':
      - indices:admin/exists
      - indices:admin/mapping/put
      - indices:admin/mappings/fields/get
      - indices:admin/refresh
      - indices:admin/validate/query
      - indices:data/read/get
      - indices:data/read/mget
      - indices:data/read/search
      - indices:data/write/delete
      - indices:data/write/index
      - indices:data/write/update
      - indices:admin/create

```

使用这个配置，任何有kibana4角色的人都可以使用kibana,但是只能看到他能看到的数据，

现在外面启动kibana服务器，看看跑起来后的效果

```

$ kibana/bin/kibana
{"@timestamp":"2015-02-26T08:53:18.961Z","level":"info","message":"Listening on 0.0.0.0:5601","node_env":"production"}

```

打开浏览器，输入 localhost:5601，使用alice账户登录。

登录之后，kibana会要求索引类型，我们保持简单。在里面输入case这个索引

然后去discover界面。

使用那个bob的账户登录的话，可以看到2个索引。ok，大功告成。

个人总结：

首先定一个用户
只能看到指定的index的数据，然后不能删除那个index

