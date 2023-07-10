---
layout: page

title: Kafka命令
category: kafka
categoryStr: 大数据
tags: kafka
keywords: kafka command
description: kafka常用命令
---

一些使用Kafka时经常用到的命令。

**启动kafka**

JMX_PORT=9997  bin/kafka-server-start.sh config/server.properties &

**关闭kafka** 

bin/kafka-server-start.sh config/server.properties &

**建立主题** 

bin/kafka-topics.sh --create --zookeeper localhost:2181 --replication-factor 3 --partitions 6 --topic my-replicated-test

**删除主题，慎用 ** 只会删除zookeeper中的元数据，数据文件需手动删除 

bin/kafka-topics.sh --delete --zookeeper 10.45.130.186:2181,10.45.130.187:2181,10.45.130.189:2181 --topic esb.topic

**命令查看主题** 

bin/kafka-topics.sh --list --zookeeper localhost:2181

**查看主题详情** 

bin/kafka-topics.sh --describe --zookeeper localhost:2181 --topic my-replicated-test

**建立生产者发送消息** 

bin/kafka-console-producer.sh --broker-list localhost:9092 --topic my-replicated-test

**添加partition** 

/bin/kafka-topics.sh –zookeeper localhost:2181/config/mobile/mq –alter –partitions 20 –topic
topicName
/bin/kafka-topics.sh --zookeeper localhost:2181 /kafka --alter --topic *** --partitions 10

**建立消费者接受消息** 

bin/kafka-console-consumer.sh --zookeeper localhost:2181 --topic my-replicated-test --from-beginning

**删除消费者** 

bin/kafka-consumer-groups.sh --zookeeper 10.45.130.186:2181,10.45.130.187:2181,10.45.130.189:2181 --delete --group api-exception

**查看消费者列表** 

bin/kafka-consumer-groups.sh --list --zookeeper 10.45.130.186:2181,10.45.130.187:2181,10.45.130.189:2181 

**查看消费者详情** 

bin/kafka-consumer-groups.sh --describe --zookeeper localhost:2181 --group console-consumer-35398

**重新分配分区** 

bin/kafka-reassign-partitions.sh --topics-to-move-json-file topics-to-move.json --broker-list "171" --zookeeper 192.168.197.170:2181,192.168.197.171:2181 --execute
cat topic-to-move.json
{"topics":
  [{"topic": "test2"}],
  "version":1
}

**_consumer_offset消费** 

```
#Create consumer config
echo "exclude.internal.topics=false" > /tmp/consumer.config
#Only consume the latest consumer offsets
./kafka-console-consumer.sh --consumer.config /tmp/consumer.config \
--formatter "kafka.coordinator.GroupMetadataManager\$OffsetsMessageFormatter" \
--zookeeper localhost:2181 --topic __consumer_offsets

**手动均衡topic** 

```

bin/kafka-preferred-replica-election.sh --zookeeper 192.168.197.170:2181,192.168.197.171:2181 --path-to-json-file preferred-click.json
cat preferred-click.json
{
 "partitions":
  [
  {"topic": "click", "partition": 0},
  {"topic": "click", "partition": 1},
  {"topic": "click", "partition": 2},
  {"topic": "click", "partition": 3},
  {"topic": "click", "partition": 4},
  {"topic": "click", "partition": 5},
  {"topic": "click", "partition": 6},
  {"topic": "click", "partition": 7},
    ]
}

```

**修改kafka Replication factor副本数量**

1.bin/kafka-topics.sh --zookeeper host:port --alter --topic name --replication-factor 3
好像操作较重，不太推荐（试了下不行）
2.bin/kafka-preferred-replica-election.sh --zookeeper localhost:12913/kafka --path-to-json-file topicPartitionList.json

3.使用kafka-reassign-partitions.sh（唯一可用）
bin/kafka-reassign-partitions.sh --zookeeper localhost:2181 --reassignment-json-file test.json --execute




**kafka启动时设置JMX环境变量** 
之所以要这么设置，是因为线上环境，Kafka Manager需要配置Kafka节点的域名，使用IP非同台机器会报错

```

KAFKA_JMX_OPTS="-Dcom.sun.management.jmxremote -Dcom.sun.management.jmxremote.authenticate=false  -Dcom.sun.management.jmxremote.ssl=false -Djava.rmi.server.hostname=$ip" JMX_PORT=9997 bin/kafka-server-start.sh config/server.properties

```
**启动kafka-manager如要设置访问端口，加-Dhttp.port=8080**

nohup bin/kafka-manager -Dconfig.file=conf/application.conf  -Dapplication.home=/data/kafka-manager &

有时启动会报错，需要删除掉/var/run / \$\{\{app_name\}\}.pid这个鬼文件。

**查看kafka打开的连接数** 

```

lsof -n  | grep `ps aux | grep kafka  | grep -v grep| grep -v kafka-manager | awk '{print $2}'`  | awk '{print $2}'|sort|uniq -c|sort -nr | awk '{print $1}'

```

