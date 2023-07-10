---
layout: page

title: JAVA的JDBC事务详解-转载
category: mysql
categoryStr: MySQL
tags: 
keywords: 
description: 
---


### 事务的特性：

1. 原子性（atomicity）：事务是数据库的逻辑工作单位，而且是必须是原子工作单位，对于其数据修改，要么全部执行，要么全部不执行。
2. 一致性（consistency）：事务在完成时，必须是所有的数据都保持一致状态。在相关数据库中，所有规则都必须应用于事务的修改，以保持所有数据的完整性。
3. 隔离性（isolation）：一个事务的执行不能被其他事务所影响。
4. 持久性（durability）：一个事务一旦提交，事物的操作便永久性的保存在DB中。即使此时再执行回滚操作也不能撤消所做的更改。

事务(Transaction):是并发控制的单元，是用户定义的一个操作序列。这些操作要么都做，要么都不做，是一个不可分割的工作单位。  
通过事 务，sql server 能将逻辑相关的一组操作绑定在一起，以便服务器 保持数据的完整性。  
事务通常是以begin transaction开始，以commit或rollback结束。Commint表示提交，即提交事务的所有操作。   
具体地说就是将事务中所有对数据的 更新写回到磁盘上的物理数据库中去，事务正常结束。  
Rollback表示回滚，即在事务运行的过程中发生了某种故障，事务不能继续进行，系统将事务中对数 据库的所有已完成的操作全部撤消，滚回到事务开始的状态。 

自动提交事务：每条单独的语句都是一个事务。每个语句后都隐含一个commit。 （默认）  

显式事务：以begin transaction显示开始，以commit或rollback结束。  

隐式事务：当连接以隐式事务模式进行操作时，sql server数据库引擎实例将在提交或回滚当前事务后自动启动新事务。   
无须描述事物的开始，只需提交或回滚每个事务。但每个事务仍以commit或 rollback显式结束。连接将隐性事务模式设置为打开之后，  
当数据库引擎实例首次执行下列任何语句时，都会自动启动一个隐式事务：  
alter table，insert，create，open ，delete，revoke ，drop，select， fetch ，truncate table，grant，update在发出commit或rollback语句之前，该事务将一直保持有效。  
在第一个事务被提交或回滚之后，下次当连接 执行以上任何语句时，数据库引擎实例都将自动启动一个新事务。该实例将不断地生成隐性事务链，直到隐性事务模式关闭为止。  
 
### Java JDBC事务机制

  首先，我们来看看现有JDBC操作会给我们打来什么重大问题，比如有一个业务：当我们修改一个信息后再去查询这个信息，看是这是一个简单的业务，实现起来 也非常容易，  
  但当这个业务放在多线程高并发的平台下，问题自然就出现了，比如当我们执行了一个修改后，在执行查询之前有一个线程也执行了修改语句，  
  这是我们再执行查询，看到的信息就有可能与我们修改的不同，为了解决这一问题，我们必须引入JDBC事务机制，其实代码实现上很简单，一下给出一个原理实现例子 供大家参考：  

```

private Connection conn = null;  
private PreparedStatement ps = null;  
 
try {  
    conn.setAutoCommit(false);  //将自动提交设置为false  
              
    ps.executeUpdate("修改SQL"); //执行修改操作  
    ps.executeQuery("查询SQL");  //执行查询操作                 
    conn.commit();      //当两个操作成功后手动提交  
              
} catch (Exception e) {  
    conn.rollback();    //一旦其中一个操作出错都将回滚，使两个操作都不成功  
    e.printStackTrace();  
} 

```

### 与事务相关的理论

1. 事务(Transaction)的四个属性(ACID)

原子性(Atomic) 对数据的修改要么全部执行，要么全部不执行。  

一致性(Consistent) 在事务执行前后，数据状态保持一致性。  

隔离性(Isolated) 一个事务的处理不能影响另一个事务的处理。  

持续性(Durable) 事务处理结束，其效果在数据库中持久化。  

2. 事务并发处理可能引起的问题

脏读(dirty read) 一个事务读取了另一个事务尚未提交的数据，  
不可重复读(non-repeatable read) 一个事务的操作导致另一个事务前后两次读取到不同的数据  
幻读(phantom read) 一个事务的操作导致另一个事务前后两次查询的结果数据量不同。  

举例：  
事务A、B并发执行时，  
当A事务update后，B事务select读取到A尚未提交的数据，此时A事务rollback，则B读到的数据是无效的"脏"数据。  
当B事务select读取数据后，A事务update操作更改B事务select到的数据，此时B事务再次读去该数据，发现前后两次的数据不一样。  
当B事务select读取数据后，A事务insert或delete了一条满足A事务的select条件的记录，此时B事务再次select，发现查询到前次不存在的记录("幻影")，或者前次的某个记录不见了。  

### JDBC的事务支持

JDBC对事务的支持体现在三个方面：

1. 自动提交模式(Auto-commit mode)

Connection提供了一个auto-commit的属性来指定事务何时结束。  
a.当auto-commit为true时，当每个独立SQL操作的执行完毕，事务立即自动提交，也就是说每个SQL操作都是一个事务。  
一个独立SQL操作什么时候算执行完毕，JDBC规范是这样规定的：    
对数据操作语言(DML，如insert,update,delete)和数据定义语言(如create,drop)，语句一执行完就视为执行完毕。    
对select语句，当与它关联的ResultSet对象关闭时，视为执行完毕。   
对存储过程或其他返回多个结果的语句，当与它关联的所有ResultSet对象全部关闭，所有update count(update,delete等语句操作影响的行数)  
和output parameter(存储过程的输出参数)都已经获取之后，视为执行完毕。   
b.当auto-commit为false时，每个事务都必须显示调用commit方法进行提交，或者显示调用rollback方法进行回滚。auto-commit默认为true。  
JDBC提供了5种不同的事务隔离级别，在Connection中进行了定义。  

2. 事务隔离级别(Transaction Isolation Levels)

JDBC定义了五种事务隔离级别：  

TRANSACTION_NONE JDBC驱动不支持事务  

TRANSACTION_READ_UNCOMMITTED 允许脏读、不可重复读和幻读。  

TRANSACTION_READ_COMMITTED 禁止脏读，但允许不可重复读和幻读。  

TRANSACTION_REPEATABLE_READ 禁止脏读和不可重复读，单运行幻读。  

TRANSACTION_SERIALIZABLE 禁止脏读、不可重复读和幻读。  

3. 保存点(SavePoint)

JDBC定义了SavePoint接口，提供在一个更细粒度的事务控制机制。当设置了一个保存点后，可以rollback到该保存点处的状态，而不是rollback整个事务。  
Connection接口的setSavepoint和releaseSavepoint方法可以设置和释放保存点。  
JDBC规范虽然定义了事务的以上支持行为，但是各个JDBC驱动，数据库厂商对事务的支持程度可能各不相同。如果在程序中任意设置，可能得不到想 要的效果。  
为此，JDBC提供了DatabaseMetaData接口，提供了一系列JDBC特性支持情况的获取方法。比如，通过 DatabaseMetaData.supportsTransactionIsolationLevel方法  
可以判断对事务隔离级别的支持情况，通过 DatabaseMetaData.supportsSavepoints方法可以判断对保存点的支持情况。  
