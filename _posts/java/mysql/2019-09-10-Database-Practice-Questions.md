---
layout: page

title: Java面试题-数据库笔试题收集MySQL
category: mysql
categoryStr: MySQL
tags:
keywords:
description:
---



	* 好久没更新了，最近又开始面试了，今天面了字节，于是有了新的题目，更新在最后面了
	* 
最近面了个试，写了这么久的sql，面试的时候突然发现，有时候能写出来和面试中把思路说出来说清楚还是有点区别的，写出来的时候，写不通就去google一下，函数记不起来也可以google一下，然而面试的时候需要把怎么写说出来。还是需要多练习多想吖。所以最近的目标有两个吧，一个是补充一下SQL的概念性的知识，第二个是把概念性的知识和这篇文章中的题当成面试题说一遍。 在下文第10题会补充一下概念的题。
*
因为自己的windows系统搭建mysql环境一直失败，MAC本本又被我摔坏屏送去修了，所以找到一个在线数据库以供测试：



SQL Fiddle | A tool for easy online testing and sharing of database problems and their solutions.www.sqlfiddle.com/

	* 
今天了解了一下HIVE SQL 和sql的区别：


简单地来说hive就是一个搭建在hadroop上的帮助不会用hadroop和MapReduce的人，比如我，用类SQL语句来分析大数据的软件。在查询分析的功能上HIVE SQL和SQL没有特别大的区别，所以我还是先学好sql，再去考虑hive 的底层架构的问题吧。
*
今天继续更新一下概念性的问题：视图和表有什么区别和联系：


视图是数据库表的一个抽象子集，它是子集因为它仅仅展示数据库表的一部分数据，可以禁止所有用户访问底层数据库表，而只通过视图操作数据。它是抽象的因为，它从表里提取数据，形成虚拟表，是编译好的sql语句，而并没有实际的物理记录。使用视图的好处是：① 有利于提高执行效率 ②对视图的创建和删除不会影响数据库表，保护数据库的数据安全
*
总结一下截止目前遇到的问题类型：


	1. 
DML相关（创建，更新，删除表，插入值）
2.
简单查询
3.
复杂查询：子查询，多表查询，聚合函数的使用
4.
行转列问题
5.
consecutive comparing, Cumulative summing (self join)
6.
SQL中常用高级函数相关的题目【case when end】【if】【substr/concat/split】
7.
基础进阶【日期函数】【分组排序：row_number()】【取百分比：percentile】 Reference: 无眠：数据分析面试必备——SQL你准备好了吗？
8.
DAU的分析，次日留存、三日留存、七日留存，及留存率

今天进一步总结了比较复杂的sql题目，主要有下面几个专题，应该不时专注练一练
*
排名问题：


求各个部门薪水前三的员工名单；求班级分数排名表等
*
区间划分问题 -- 行转列问题


给一张按时间顺序排列的销售表，统计各月份的销售情况，输出统计表
一张分数表，统计不同分数段的人数
统计各门课程的选课情况
*
计算留存人数和留存率/计算连续登陆天数
*
计算新增用户数/新增用户表
*
字段连接问题：


将员工名和姓用·连接输出新的一列
*
SQL的优化：设计索引、视图的问题


今天学习了一种新题型：制作嵌套式侧栏，1. 牛客网：数据库实战：61道SQL基础

数据库SQL实战_牛客网www.nowcoder.com/ta/sql2. LEETCODE: Database 免费题库，编程基础题3. 拼多多2020学霸批数据分析师笔试题：业务应用

CSDN-专业IT技术社区-登录blog.csdn.net/weixin_44915703/article/details/97681625
*
活动分析


表ord（用户订单表）; 表act_usr（活动参与用户表）
(1) 创建表act_output，保存以下信息：区分不同活动，统计每个活动对应所有用户在报名参与活动之后产生的总订单金额、总订单数（一个用户只能参加一个活动）。


create table act_output as
select au.act_id, count(o.ord_id) as total_oder, sum(o.ord_amt) as total_amountfrom act_user as au left join ord as o
on au.user_id = o.user_id
where o.create_time >= au.create_timegroup by au.act_id
(2) 加入活动开始后每天都会产生订单，计算每个活动截止当前（测评当天）平均每天产生的订单数，活动开始时间假设为用户最早报名时间。


select au.act_id, count(o.ord_id)/count(distinct o.create_time)
from act_user as au left join ord as o
on au.user_id = o.user_id
where o.create_time >= au.create_time
group by au.act_id
*
用户行为


某网络用户访问操作流水表 tracking_log;
(1) 计算网站每天的访客数以及他们的平均操作次数;


select log_time, count(distinct user_id) as cnt, (count(*)/cnt) as avg_cnt
from tracking_log
where log_time between xxxxx and xxxxx
group by log_time
虽然题目中没有提出在哪个时间段内进行检索，但是实务中一定要记得加类似或者limit的现值条件。
(2) 统计每天符合A操作后B操作的操作模式的用户数，即要求AB相邻。
*
用户新增和用户留存


（1）计算网络每日新增访客表（在这次访问之前没有访问过该网站）；
（2）新增访客的第2日、第30日回访比例。
4. 网易2020年校招-数据分析师
    *
假设有选课表course_relation(student_id, course_id)，其中student_id表示学号，course_id表示课程编号，如果小易现在想获取每个学生所选课程的个数信息？




select student_id, count(course_id) as cnt from course_relation
group by student_id;
*
在数据库中有一张用户交易表order，其中有userid（用户ID）、orderid（订单ID）、amount（订单金额）、paytime（支付时间），请写出对应的SQL语句，查出每个月的新客数（新客指在严选首次支付的用户），当月有复购的新客数，新客当月复购率（公式=当月有复购的新客数/月总新客数）

5. 小红书2019年校园招聘数据分析岗位在线笔试
    *
想要了解班级内同学的考试情况，现有一张成绩表表名为A，每行都包含以下内容（已知表中没有重复内容，但所有的考试结果都录入在了同一张表中，一个同学会有多条考试结果）：student_id，course_name，score


（1）每门课程得到成绩的同学人数


select course_name, count(distinct student_id)
from table
where score is not null
group by course_name;
(2) 每门课程的平均成绩


select course_name, avg(score)
from table
group by course_name;
(3) 如果对于每门课程来说，60分以下为不及格，高于60为及格，统计每门课程及格和不及格的人数


select course_name, sum(if(score >= 60, 1,0)) as PASS,
sum(if(score < 60, 1,0)) as FAIL
from table6. 常见的SQL面试题：经典50题

猴子：常见的SQL面试题：经典50题4568 赞同 · 223 评论文章

已知有如下4张表：
学生表：student(学号,学生姓名,出生年月,性别)
成绩表：score(学号,课程号,成绩)
课程表：course(课程号,课程名称,教师号)
教师表：teacher(教师号,教师姓名)
根据以上信息按照下面要求写出对应的SQL语句。
数据表间关系
*
查找姓“猴”的学生名单




select * from student
where student_name like '猴%'
*
查找姓名中包含猴字的学生名单




select * from student
where student_name like "%猴%"
知识点：SQL中的通配符
%：代替任意字符串
_: 代替任意一个字符
[charlist]：字符列中的任意一个字符（MySQL不支持）
[^charlist] 或者 [!charlist]： 不在字符列中的任何单一字符（MySQL不支持）
*
查询姓孟老师的个数




select count(*)
from teacher
where teacher_name like "孟%"
*
查询0002课程的平均成绩




select course_id, avg(score) as avg_scorefrom score
group by course_id
having course_id = '0002'
*
查询每门课程选课的学生人数




select count(distinct student_id) as cntfrom score
group by course_id
*
查询各科成绩最高和最低的分




select course_id, max(score) as max_score, min(score) as min_score
from score
group by course_id
*
查询男生，女生人数




select count(*)
from student
group by gender
*
查询平均成绩大于60分学生的学号和平均成绩




select student_id, avg(score) as avg_scorefrom score
group by student_id
having avg_score > 60;
*
查询至少选修两门课程的学生学号




select student_idfrom score
group by student_id
having count(distinct course_id) >= 2
*
查询同名同姓学生名单并统计同名同姓的人数




select student_name, count(distinct student_id) as cnt
from student
having cnt > 1
*
查询每门课程的平均成绩，结果按平均成绩升序排列，平均成绩相同时，按课程号降序排列
*
检索课程号为0004且分数小于60的学生学号，结果按分数降序排列
*
输出课程号和选修人数，查询结果按人数降序排列，若人数相同，按课程号升序排列
*
查询两门以上课程不及格的同学学号及其平均成绩
*
查询所有课程成绩小于60分学生的学号、姓名




select C.course_id, C.student_id, S.student_name
from score C left join student S
on C.student_id = S.student_id
where C.score < 60
*
查询没有学全所有课程的学生的学号，姓名
*
查询只选修了两门课程的学生的学号、姓名
*
查询1990年出生的学生名单




select *
from student
where year(birthday) = '1990'
SQL 日期相关函数及其用法
*
查询所有学生的学号、姓名、选课数、总成绩
*
查询平均成绩大于85的所有学生的学号、姓名和平均成绩
*
查询学生的选课情况：学号，姓名，课程号，课程名称
*
查询每门课程的及格人数和不及格人数




select course_id, sum(if(score >= 60, 1,0)) as PASS,
sum(if(score <60, 1,0)) as FAIL
from score
group by course_id
*
使用分段[100-85],[85-70],[70-60],[<60]来统计各科成绩，分别统计：各分数段人数，课程号和课程名称


①使用if function


select A.course_id, B.course_name, sum(if(A.score < 60, 1, 0)),
sum(if(A.score >=60 and A.score < 70, 1,0)), sum(if(A.score >=70 and A.score <80,1,0)),
sum(if(A.score >= 80 and A.score <100))
from Score A left join course B
on A.course_id = B.course_id
group by A.course_id
*
使用sql实现将表1行转列为表2的结构（行转列问题）


表1表2


select student_id,
max(if(course_id = '001',score, 0)) as "course 001",
max(if(course_id = '002', score, 0)) as "course 002"
from score
group by student_id7. 数据分析之SQL面试题

数据分析之SQL面试题www.jianshu.com/p/77597eadd3cc

	* 
计算连续登陆天数


类似的题目还有https://blog.csdn.net/zhenglit/article/details/88063821

Row_number() 函数的使用: ① Assigning sequencial numbers to rows; ② finding top N rows in each group; ③ pagination using row_number();
Reference: https://www.mysqltutorial.org/mysql-window-functions/mysql-row_number-function/


# 思路：如果row_number 是连续的，那么，day - row_number 的值应该是恒定的
# 若 day - row_number的值发生了变化，则说明在变化点处，不连续
select b.UID, MAX(b.gro_cnt) as maxloggingday from(select UID, count(*) as gro_cnt from
(select UID, (day(loadtime) - row_number() over(partition by UID order by UID)) as cntfrom loadrecord) as agroup by a.UID, a.cnt) group by b,UID

# 有三层检索，检索共分为三步
# 第一层检索，
	* 
选出每门科目成绩排名前三的学生（可用两种方式实现，用row_number函数和不用row_number 函数，见leetcode，之前做过一道类似的）


row _number, dense_rank 和 rank都可以用于排序，区别是，row_number() 不重复，按顺序递增或递减； dense_rank 会出现1，1，2 这样的排序结果；rank 只会出现1,1,3这样的排序结果。reference: https://www.mysqltutorial.org/mysql-window-functions/mysql-rank-function/


select student_name from
(select *, rank() over(partition by course_id order by score) as row_num from score)
where row_num <=3;
*
各部门员工薪水排名




select *, rank() over (partition by dept_id order by salary) as cnt
from salaries;8. 数据分析sql面试题目9套汇总 (较复杂)
Reference：

凡人求索：数据分析SQL面试题目9套汇总24 赞同 · 10 评论文章
*
求用户号对应的前两个不同场景（场景重复的话，选重复场景的第一个访问时间，场景不足两个的输出为止）。输出栗子：1-1001-1002；2-1002。


该题目与牛客网第53题类似，可以用group_concat 函数解决，但是比牛客网第53题更复杂：① 需要排序；②当scen大于2时，只能取2个值；③而且涉及到两列的concat；
log表输出结果示例


select concat(A.userid,'-', group_concat(distinct A.changjing SEPARATOR '-')from (
select *, row_number() over (partition by userid order by inttime) as cnt
from datafrog_test1
where cnt < 3
) Agroup by A.userid；
*
相机是深受大家喜爱的应用之一，现在我们需要研究相机的用户活跃情况，需统计如下数据：某日活跃的用户（UID）在后续一周内的留存情况（计算次留、三留、七留）：活跃用户数为整数，留存率为百分比，结果保留两位


result example


# 计算活跃用户数
select date, count(distinct uid) as active_user_num
from act_user_info
where app_name = "相机"
group by date
查找次日留存属于consecutive comparing, 和leetcode中的一道题目类似，可以用self-join解决


select
a.day1,count(distinct case when day2-day1=1 then a.uid end) 次留
from
(select uid,date_format(dayno,'%Y%m%d')as day1 from aui where app_name='相机') a
#用date_format把dayno的文本格式改为可计算的形式
left join
(select uid,date_format(dayno,'%Y%m%d')as day2 from aui where app_name='相机') b
on a.uid=b.uid
group by a.day1;
同理可得3日和7日留存的计算方法


select
day1,count(distinct a.uid) 活跃,
count(distinct case when day2-day1=1 then a.uid end) 次留,
count(distinct case when day2-day1=3 then a.uid end) 三留,
count(distinct case when day2-day1=7 then a.uid end) 七留,
concat(count(distinct case when day2-day1=1 then a.uid end)/count(distinct a.uid)*100,'%') 次日留存率,
concat(count(distinct case when day2-day1=3 then a.uid end)/count(distinct a.uid)*100,'%') 三日留存率,
concat(count(distinct case when day2-day1=7 then a.uid end)/count(distinct a.uid)*100,'%') 七日留存率
from (select uid,date_format(dayno,'%Y%m%d') day1 from aui where app_name = '相机') a
left join (select uid,date_format(dayno,'%Y%m%d') day2 from aui where app_name = '相机') b
on a.uid=b.uid
group by day1;
这是留存率分析的问题，关于用sql进行留存率分析的问题，在简书上看到一篇写得比较清楚的解析,用了另外一种方法，即多重子查询的嵌套，reference：https://www.jianshu.com/p/be2cb8880df6
*
表格格式转换：行转列


创建表


create table course (
id varchar(20),
teacher_id varchar(20),
week_day varchar(20),
has_course varchar(20));
insert into course value
(1,1,2,"Yes"),
(2,1,3,"Yes"),
(3,2,1,"Yes"),
(4,3,2,"Yes"),
(5,1,2,"Yes");
答案：


select teacher_id, if(week_day =1, has_course, '') as mon,
if(week_day = 2, has_course,'') as tue,
if(week_day = 3, has_course,'') as wed,
if(week_day = 4, has_course,'') as thu,
if(week_day = 5, has_course,'') as fri
from course
*
表格格式转换：列转行




select name, "english" as subject, english as score
from A
union
select name, "maths" as subject, maths as score
from A
union
select name, "music" as subject, music as score
from A
*
根据表A,B写出相关问题的sql语句：①对A标的FDATE列添加索引；②通过sql语句，将A表数据计算后得到B表结果，并描述执行过程；


A

	* 
根据log表：①查询出每个用户最近一次登录的记录以及给出每个用户的登陆总次数（同一天多次登陆记为一次）


Log


select id, name, max(lastlogon), count(distinct date(lastlogon))
from log
group by id
*
table A 和B的相互转换： Group_concat 和 substring_ index的使用


Table ATable B


# A 转为B
select qq, group_concat(game,'_') as Game
from A
group by qq

# B 转为9. SQLZOO 的习题

https://sqlzoo.net/wiki/SELECT_basics/zhsqlzoo.net/wiki/SELECT_basics/zh


10. 补充一些SQL的基础概念题
    先推荐一个网站：

企业面试题｜最常问的MySQL面试题集合（一） - 阅读 - 掘金juejin.im/entry/5b57ec015188251aa8292a69

LionKing数据科学专栏www.dscademy.com/languages/sql/
*
什么是SQL



结构化查询语言（Structured query language）,用于管理关系型数据库的编程语言
*
SQL有哪些类型的语句：




五大类：
DDL: Data definition language
a set of statements that allow the user to define or modify data structures and objects(table etc.)
create
alter
add
remove
drop
rename
truncate

DML：Data manipulation language
insert
update table_name set column_name = xxx where column_name = xxx
delete from table_name where xxx


DQL：Data query language(有的会把DML和DQL算作一类)
select


DCL: Data control language
TCL: Transaction control language
commit;
rollback;
*
drop table table_name， truncate 和delete有什么区别




drop table 删除整个table；
truncate table 删除table中的所有记录；
delete table 删除table中的某一行或某几行记录；
*
SQL的数据类型：




STRING:
CHAR(M)
VARCHAR(M)
ENUM(val1,val2,...)
NUMERIC:
TINYINT(M)
SMALLINT(M)
INT(M)
BIGINT(M)
FLOAT(SIZE, D)
DOUBLE(SIZE,D)
DECIMAL(SIZE,D)
BOOL
BOOLEAN
TIME：
DATE
DATETIME(fsp)
TIMESTAMP(fsp)
TIME(fsp)
YEAR
数据类型相关的题：
varchar 和 char有什么区别？
varchar（size）：括号里的数字有什么含义？
int（M）括号里的数字有什么含义？为什么要这样设计？
FLOAT,DOUBLE 和 DECIMAL的区别？
DATETIME 和 TIMESTAMP 的区别？
1.DATETIME的日期范围是1001——9999年，TIMESTAMP的时间范围是1970——2038年。
2.DATETIME存储时间与时区无关，TIMESTAMP存储时间与时区有关，显示的值也依赖于时区。在mysql服务器，操作系统以及客户端连接都有时区的设置。
3.DATETIME使用8字节的存储空间，TIMESTAMP的存储空间为4字节。因此，TIMESTAMP比DATETIME的空间利用率更高。
4.DATETIME的默认值为null；TIMESTAMP的字段默认不为空（not null）,默认值为当前时间（CURRENT_TIMESTAMP），如果不做特殊处理，并且update语句中没有指定该列的更新值，则默认更新为当前时间。
本答案来自：https://blog.csdn.net/u013399093/java/article/details/52294619


11. 拼多多大数据开发工程师sql实战解析

拼多多大数据开发工程师SQL实战解析 - James_Shangguan - 博客园www.cnblogs.com/sgh1023/p/10591849.html

看了一些拼多多的面经，觉得拼多多的sql题还挺有意思的，跟业务结合得很紧密。


# 构建数据库
CREATE TABLE orders(
id INT PRIMARY KEY AUTO_INCREMENT,
order_time TIMESTAMP,
cate VARCHAR(255),
goods_id int,
order_amount int)；INSERT INTO orders(order_time,cate,goods_id,order_amount)
VALUES ('2018-02-28 00:00:01', '水果',223,100),('2018-02-28 01:01:01', '花茶',444,111),('2018-02-28 06:06:06', '花茶',444,666),('2018-03-01 07:01:10', '花茶',5555,170),('2018-03-01 08:00:00', '花茶',5555,180),('2018-03-01 00:00:01', '花茶',333,100),('2018-03-01 00:00:01', '花茶',444,188),('2018-03-01 00:00:01', '数码',45454,5399)；
*
请统计2018年全年每月销售额，输出两列，分别为月份，销售额


解法一:


select concat(year(order_time),'-',month(order_time)) as months, sum(order_amount) as Sales
from orders
where year(order_time) = 2018
group by months
解法二：使用date_format 函数
date_format(date, format);
for example: date_format(date, '%Y-%M') 即可从2018-03-13 中提取出2018-03


select date_format(order_time, '%y-%m') as months, sum(order_amount) as sales
from orders
where year(order_time) = 2018
group by months;
*
请统计2018年每月销售额，以及金额排名，输出三列，分别为月份、销售额、金额排名




select A.months, A.sales, dense_rank() over(order by sales) as sales_rank
from
(select date_format(order_time, '%y-%m') as months,
sum(order_amount) as sales，
from orders
where year(order_time) = 2018
group by months) A12. sql优化和索引常见面试题

sql优化和索引常见的面试题(面试总结)_数据库_建仔的博客专栏-CSDN博客blog.csdn.net/weixin_44504146/article/details/92737613
13. 一亩三分地sql面经总结

SQL面经汇总|一亩三分地数据科学版www.1point3acres.com/bbs/thread-438830-1-1.html
14. SQL 实战 -- 淘宝用户分析

卡拉麦拉芙：淘宝用户分析37 赞同 · 2 评论文章

最近正在寻找一个用户数据集练习一下实战能力，感恩这篇文章的作者，找到一个不错的数据库，虽然时间上比较滞后，但是数据量足够，reference：https://tianchi.aliyun.com/dataset/dataDetail?dataId=64915. 电商业务常用指标分析之SQL实现

https://jiamaoxiang.top/2019/12/05/%E7%94%B5%E5%95%86%E4%B8%9A%E5%8A%A1%E5%B8%B8%E7%94%A8%E6%8C%87%E6%A0%87%E5%88%86%E6%9E%90%E4%B9%8BSQL%E5%AE%9E%E7%8E%B0/jiamaoxiang.top/2019/12/05/%E7%94%B5%E5%95%86%E4%B8%9A%E5%8A%A1%E5%B8%B8%E7%94%A8%E6%8C%87%E6%A0%87%E5%88%86%E6%9E%90%E4%B9%8BSQL%E5%AE%9E%E7%8E%B0/16.《 SQL进阶教程》中的习题
*
练习题1-1-1 多列数据中的最大值


从表中选出所有列中的最大值，输出为新的一列，列名为greatest
tableresult

```
__ create table
create table course (
ID varchar(20) primary key,
x int(20),
y int(20),
z int(20));
insert into course value
('A',1,2,3),
('B',1,3,4),
('C',5,1,5),
('D',6,2,6),
('E',1,2,1);
```
__ solution

select c4.ID, max(c4.greatest)
from
(select c1.ID, c1.x as Greatest
from course c1
union all
select c2.ID, c2.y as greatest
from course c2
union all
select c3.ID, c3.z as greatest
from course c3) c4
group by c4.ID
*
练习题 1-1-2 行列转换并汇总


TableResult


# create table
create table Pop (
pref_name varchar(20),
sex int(20),
population int(20));
insert into Pop value
('重庆',1,60),
('重庆',2,40),
('深圳',1,100),
('深圳',2,100),
('广州',1,50),
('广州',2,100),
('上海',1,100),
('上海',2,200),
('天津',1,20),
('天津',2,80),
('成都',1,125),
('成都',2,250);

# result

select case when sex= 1 then '男' else '女' end as sex,
sum(case when pref_name = '重庆' then population else 0 end) as '重庆',
sum(case when pref_name = '深圳' then population else 0 end) as '深圳',
sum(case when pref_name = '广州' then population else 0 end) as '广州',
sum(case when pref_name = '上海' then population else 0 end) as '上海',
sum(case when pref_name = '天津' then population else 0 end) as '天津',
sum(case when pref_name = '成都' then population else 0 end) as '成都',
sum(population) as total
FROM Pop
GROUP BY sex
*
练习题 1-2-1 可重组合


请使用下表，求出两列可重组和。
TableResult


__ create table

create table product (name varchar(20),price float(20));insert into product value('Apple',6),('Banana',4),('Orange',10);

__ resultSelect p2.name, p1.name
From product p1,product p2where p2.name <= p1.name
*
练习题 1-2-2： 排序


根据表DistrictProducts, 计算各个地区的商品价格位次。
Table


__CREATE TABLE

create table DistrictProduct (
district varchar(20),
name varchar(20),
price float(20));
insert into DistrictProduct value
('Beijing','Apple',6),
('Beijing','Banana',4),
('Beijing','Orange',10),
('Beijing','Lemon',6),
('Shanghai','Banana',8),
('Shanghai','Orange',8),
('Shanghai','Apple',8),
('Shanghai','Lemon',6),
('Shenzhen','Lemon',6),
('Shenzhen','Apple',6),
('Shenzhen','Banana',4),
('Shenzhen','Orange',10);

__SOLUTION

SELECT d1.district, d1.name, d1.price,
COUNT(d2.name)+1 AS rank
FROM DistrictProduct d1
LEFT JOIN DistrictProduct d2
ON d1.district = d2.district
AND d2.price < d1.price
GROUP BY d1.district,d1.name
ORDER BY d1.district,rank
*
练习题 1-4-1 修改编号缺失的检查逻辑，使结果总是返回一行数据


将sql语句修改成始终返回一行结果，即存在缺失编号时返回存在缺失的编号，不存在缺失的编号时返回“不存在缺失的编号”。
TableResult


__ CREATE TABLEcreate table SeqTbl (seq varchar(5) PRIMARY KEY,name varchar(20));insert into SeqTbl value(1,'Apple'),(2,'Banana'),(3,'Orange'),(5,'Lemon');

__ SOLUTION

SELECT CASE WHEN count(*) = MAX(seq)
THEN "不存在缺失的编号"
ELSE "存在缺失的编号" END AS gap
FROM SeqTbl
*
练习题 1-4-2 练习特征函数


使用表Students，查询“全体学生都在3月份提交了报告的学院”
Table studentsResult


__Create Table
create table students (
student_id varchar(5) PRIMARY KEY,
dept varchar(20),
sbmt_date varchar(20));
insert into students value
(100,'理学院','2020-04-02'),
(101,'理学院','2020-03-05'),
(102,'文学院',''),
(103,'文学院','2020-02-28'),
(200,'文学院','2020-03-03'),
(201,'工学院',''),
(202,'经济学院','2020-03-10');

__ Solution

SELECT dept
FROM students
GROUP BY dept
HAVING count(sbmt_date) = count(dept)
AND min(sbmt_date) >= '2020-03-01'
AND max(sbmt_date) <= '2020-03-31'
*
练习题 1-4-3 购物篮分析问题的一般化


有items表 和 shopitems表，返回展示了全部店铺结果的一览表。
shopitemsITEMSResult


__ create table
create table items (
item varchar(20) PRIMARY KEY);
insert into items value
('啤酒'),
('纸尿裤'),
('牛奶');

create table shopitems (
shop varchar(20) PRIMARY KEY,
item varchar(20));
insert into shopitems value
('杨浦','啤酒'),
('杨浦','纸尿裤'),
('杨浦','牛奶'),
('杨浦','窗帘'),
('浦东','啤酒'),
('浦东','纸尿裤'),
('浦东','牛奶'),
('大阪','电视'),
('大阪','纸尿裤'),
('大阪','牛奶');

__ SOLUTION

SELECT S1.shop, COUNT(S2.item) AS my_item_cnt, (3-COUNT(S2.item)) as diff_cnt
FROM shopitems S1 left join items S2
ON S1.item = S2.item
GROUP BY S1.shop
*
练习题 1-5-1 先JOIN 还是先聚合


在交叉表里制作嵌套式侧栏，使用小于2个临时视图完成
TblPopTblSexTblAgeResult


__ create tablecreate table TblPop (pref_name varchar(20),age_class varchar(10),sex_cd varchar(10),population int(20));insert into TblPop value('北京','1','m',400),('北京','3','m',500),('北京','1','f',300),('北京','3','f',400),('上海','1','m',400),('上海','1','f',400),('上海','3','m',400);

create table TblAge (age_class varchar(20),age_range varchar(20));insert into TblAge value('1','21-30'),('2','31-40'),('3','41-50');

create table TblSex (sex_cd varchar(20),sex varchar(20));insert into TblSex value('m','男'),('f','女');

__ solution

select t.age_class,t.sex_cd,
sum(Case when p.pref_name = '北京'
Then p.population ELSE 0 END) AS 'Beijing',
sum(Case when p.pref_name = '上海'
THEN p.population ELSE 0 END) AS 'Shanghai'FROM(SELECT a.age_class,b.sex_cdFROM TblAge a, tblsex b) Tleft join TblPop pon t.age_class = p.age_classand t.sex_cd = p.sex_cdgroup by t.age_class,t.sex_cd
*
练习题 1-5-2 请留意孩子的人数


将下列Table列转行，然后计算每个员工孩子人数，返回下表
PersonnelResult


__create table

create table Personnel (
employee varchar(20),
child1 varchar(20),
child2 varchar(20),
child3 varchar(20));

insert into Personnel value
('Mingming','Ming1','Ming2','Ming3'),
('Yiyi','YI1',null,null),
('Tiantian','Tian1','Tian2',null),
('Yuanyuan',null,null,null);

__Solution
SELECT A.employee, sum(case when A.child is not null then 1 else 0 end) as Child_cnt
FROM(
SELECT employee, child1 as child
FROM Personnel
UNION
SELECT employee, child2 as child
FROM Personnel
UNION
SELECT employee, child3 as child
FROM Personnel) A
Group by A.employee
*
练习题 1-5-3 全连接和MERGE 运算符
*
练习题 1-6-1 简化多行数据的比较
*
练习题 1-6-2 使用overlaps 查询重叠的时间区间
*
练习题 1-6-3 SUM函数可以计算出累计值，那么MAX，MIN，AVG可以计算出什么

17. BILIBILI 数据产品经理面试
    *
count（*）和count（1）的区别



What is the difference between count(0), count(1).. and count(*) in mySQL/SQL?stackoverflow.com/questions/18291036/what-is-the-difference-between-count0-count1-and-count-in-mysql-sql/18291041


https://searchoracle.techtarget.com/answer/COUNT-or-COUNT-1searchoracle.techtarget.com/answer/COUNT-or-COUNT-1


count(*) 计算查询语句返回的所有行的数量。
count（1）计算1的数量，当在select语句中包括一个常数（1,2,3,...）或者一个字符串时，这个常量会扩展成与
from语句选择出的行数相同数量。如select 1 from A, 会返回len(A)行1。
所以一般而言count（*）和count（1）有相同的结果，但是count(*)通常会更快，因为数据库一般会通过索引计算
行数。而count（1）会一行一行去判断。
count（column）会返回所有column上的值不为null的行数。
*
一张用户购买记录的日志表，userid，消费金额，time，已知每天每人仅有一条记录，求连续三天消费金额大于100 的用户列表。



18. 腾讯面试经典SQL题


苏克1900：腾讯面试官出的 2 道经典数据分析面试题zhuanlan.zhihu.com/p/117498021

题目：有一张用户签到表【t_user_attendence】，标记每天用户是否签到（说明：该表包含所有用户所有工作日的出勤记录） ，包含三个字段：日期【fdate】，用户id【fuser_id】，用户当天是否签到【fis_sign_in：0否1是】；
问题1：请计算截至当前每个用户已经连续签到的天数（输出表仅包含当天签到的所有用户，计算其连续签到天数）
输出表【t_user_consecutive_days】:用户id【fuser_id】，用户联系签到天数【fconsecutive_days】
解答逻辑非常简单，只需要用max和datediff。实际答案就留在文末好了。
问题2：请计算每个用户历史以来最大的连续签到天数（输出表为用户签到表中所有出现过的用户，计算其历史最大连续签到天数）
输出表【t_user_max_days】:用户id【fuser_id】，用户最大连续签到天数【fmax_days】

19. 字节面试最新考题：
    有一张order_table, 它有四个字段：order_id, create_time, city, product_name,求10月份每个城市的销量前10的商品。