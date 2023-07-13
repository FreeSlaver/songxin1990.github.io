---
layout: page

title: MySQL调优实战
category: mysql
categoryStr: MySQL
tags:
keywords:
description:
---

  MySQL调优的文章已经很多了，这里就不写了，本文主要是自己模拟出来MySQL的调优实战步骤，毕竟有真实的生产线上调优经验的太少，
  而且稍微上点规模的，这事也是由DBA去干的，但是Java太卷了，现在面试必问。

  MySQL一般单机到500万到1000万性能就出现瓶颈了，
## 第一步：建表
   本来想根据淘宝app的真实订单建个订单表的，但是重点在调优，不在建表，所以网上自己抄了一个
```sql
   CREATE TABLE `t_order` (
  `id` INT(10) UNSIGNED NOT NULL AUTO_INCREMENT,
  `order_no` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '订单编号',
  `order_sn` VARCHAR(100) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '交易号',
  `member_id` INT(11) NOT NULL COMMENT '客户编号',
  `supplier_id` INT(11) NOT NULL COMMENT '商户编码',
  `supplier_name` VARCHAR(255) COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '商户名称',
  `order_status` TINYINT(4) NOT NULL DEFAULT '0' COMMENT '订单状态 0未付款,1已付款,2已发货,3已签收,4退货申请,5退货中,6已退货,7取消交易',
  `after_status` TINYINT(4) NOT NULL DEFAULT '0' COMMENT '用户售后状态 0 未发起售后 1 申请售后 -1 售后已取消 2 处理中 200 处理完毕',
  `product_count` INT(11) NOT NULL DEFAULT '1' COMMENT '商品数量',
  `product_amount_total` DECIMAL(12,4) NOT NULL DEFAULT '0.0000' COMMENT '商品总价',
  `order_amount_total` DECIMAL(12,4) NOT NULL DEFAULT '0.0000' COMMENT '实际付款金额',
  `logistics_fee` DECIMAL(12,4) NOT NULL DEFAULT '0.0000' COMMENT '运费金额',
  `address_id` INT(11) NOT NULL COMMENT '收货地址编码',
  `pay_channel` TINYINT(4) NOT NULL DEFAULT '0' COMMENT '支付渠道 0余额 1微信 2支付宝',
  `out_trade_no` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '订单支付单号',
  `escrow_trade_no` VARCHAR(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL COMMENT '第三方支付流水号',
  `pay_time` INT(11) NOT NULL DEFAULT '0' COMMENT '付款时间',
  `delivery_time` INT(11) NOT NULL DEFAULT '0' COMMENT '发货时间',
  `order_settlement_status` TINYINT(4) NOT NULL DEFAULT '0' COMMENT '订单结算状态 0未结算 1已结算',
  `order_settlement_time` INT(11) NOT NULL DEFAULT '0' COMMENT '订单结算时间',
  `is_package` ENUM('0','1') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0' COMMENT '是否是套餐',
  `is_integral` ENUM('0','1') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT '0' COMMENT '是否是积分产品',
  `created_at` TIMESTAMP NULL DEFAULT NULL,
  `updated_at` TIMESTAMP NULL DEFAULT NULL,
  `deleted_at` TIMESTAMP NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=INNODB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```
## 第二步：插入一千万数据
   想想怎么在最短时间插入1000万条数据？当然是批处理和多线程了。
   我这个程序本地花了40多分钟吧，最好再加个多线程
```java
public static void main(String[] args) {
    Connection connection = null;
    //ResultSet resultSet = null;
    try {
        String dbUrl = "jdbc:mysql://localhost:3306/db_mysql_tuning?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC";
        String user = "root";
        String pwd = "root";

        Class.forName("com.mysql.cj.jdbc.Driver");
        connection = DriverManager.getConnection(dbUrl, user, pwd);
        String sql = "INSERT into t_order(`order_no`,`order_sn`,`member_id`,`supplier_id`,`supplier_name`,`order_status`," +
                "`order_amount_total`,`address_id`,`out_trade_no`,`escrow_trade_no`) VALUES(?,?,?,?,?,?,?,?,?,?)";
        connection.setAutoCommit(false);
        PreparedStatement statement = connection.prepareStatement(sql);
       long orderNo = 1622656704771347266L;
       long orderSn = 20220724141030L;
       for(int j=0;j<100;j++) {
           for (int i = 0; i < 100000; i++) {
               String orderNoStr = orderNo + i + "";
               String orderSnStr = orderSn + i + "";
               String supplierName = "商户编号" + i % 9;
               int orderStatus = i % 7;
               BigDecimal orderAmountTotal = BigDecimal.valueOf(55.5555).add(BigDecimal.valueOf(i % 100));
               int addressId = i % 9;
               String outTradeNo = "otn" + orderSnStr;
               String escrowTradeNo = "etn" + orderSnStr;

               statement.setString(1, orderNoStr);
               statement.setString(2, orderSnStr);
               statement.setInt(3, 55555 + i % 9);
               statement.setInt(4, 77777 + i % 9);
               statement.setString(5, supplierName);
               statement.setInt(6, orderStatus);
               statement.setBigDecimal(7, orderAmountTotal);
               statement.setInt(8, addressId);
               statement.setString(9, outTradeNo);
               statement.setString(10, escrowTradeNo);

               statement.addBatch();

           }
           statement.executeBatch();
           connection.commit();
       }
    } catch (SQLException e) {
        throw new RuntimeException(e);
    } catch (ClassNotFoundException e) {
        throw new RuntimeException(e);
    } finally {
        try {
            connection.close();
        } catch (SQLException e) {
            throw new RuntimeException(e);
        }
    }
}
```
## 第三步：实战场景
   数据有了，接下来要做的就是如何验证，如何触发慢查询，有2种方式：
   1. 想象一下常用的订单查询场景，条件
   2. 根据看的MySQL调优文章来反向制造各种触发慢查询的sql语句
### 常用订单查询场景
1.根据id来查询
2.根据订单号来查询
3.根据订单状态来查询
4.根据用户id和商品名称来模糊查询订单
5.查询商户，用户全部订单
6.查询用户某个日期后的所有订单
差不多只有这么些了，下面的SQL语句最好都大写
#### 根据id来查询
查100万条后的第一个数据
select * from t_order where id = 1000001
执行耗时只要0.049秒，所有根据主键id来查一点问题没有。

#### 根据订单号来查询
     SELECT * FROM t_order WHERE order_no = '1622656704771347270'
     发现一直转圈圈，发现总共花了23秒多，这种sql语句就是需要优化的。
     首先用explain命令来查看一下
     explain SELECT * FROM t_order WHERE order_no = '1622656704771347270'
     id	select_type	table	partitions	type	possible_keys	key	key_len	ref	rows	filtered	Extra
     1	SIMPLE          t_order	\N              ALL	\N               \N	\N	\N	9554913	10.00           Using where

     explain的详解自己google下，这里简单说下，
     id：1，执行explain语句的顺序
     select_type:simple，简单sql查询语句
     partitions：null，这个应该是MySQL支持的逻辑分区所在id？
     type：all，全表扫描，这个是最重要的字段了
     rows：扫描了多少行数据
     filtered：过滤掉的数据百分比
     Extra：额外信息，使用了where条件查询

     type：all，全表扫描，建表的时候没有在这个字段上建立索引，我们来建一个
     create index on ...我擦，忘记了，这个时候第一潜意识自觉反应是google，
     稍等，我们自己稍微想想，要是你写个数据库，建索引应该是怎么样的了？？？其实本质是如何将一件事情描述清楚，逻辑自洽就可以了。
     在那张表的那个字段上建立叫什么的索引
     create index on t_order column order_no (`idx_order_no`)
     去sqlyog中执行，ok，报错了，继续试，
     create index `idx_order_no` on t_order (`order_no`)
     我擦，执行成功了，但是又转圈圈了，在建立索引文件，总耗时：4分钟48秒。。。

     然后我们再来执行一次
     explain SELECT * FROM t_order WHERE order_no = '1622656704771347270'
     id	select_type	table	partitions	type	possible_keys	key             key_len	ref	rows	filtered	Extra
     1	SIMPLE          t_order	\N              ref	idx_order_no	idx_order_no	402	const	255	100.00          \N
     我们发现type变成ref了，非主键非唯一索引等值扫描，而使用到的索引是idx_order_no,
     然后结果集有255条，过滤数据100%，

     所以大表怎么建立，修改索引？？应该先将数据全部导出，然后删除所有数据，建索引，再导入。
     还是刚才的sql语句，执行，发现耗时只有0.065秒，完全能接受，性能提升巨大。

     其他的同理。
### 由sql调优经验反推
