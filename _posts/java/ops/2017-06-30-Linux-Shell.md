---
layout: page

title: Linux脚本编程
category: ops
categoryStr: 运维监控
tags: 
keywords: 
description: 
---
<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Linux Shell Linux脚本编程</a>
<ul>
<li><a href="#sec-1-1">1.1. 输入输出</a></li>
<li><a href="#sec-1-2">1.2. Pipes 管道技术</a></li>
<li><a href="#sec-1-3">1.3. 变量</a>
<ul>
<li><a href="#sec-1-3-1">1.3.1. 变量自增，自减去 ++ --</a></li>
<li><a href="#sec-1-3-2">1.3.2. $符号</a></li>
<li><a href="#sec-1-3-3">1.3.3. 例子</a></li>
</ul>
</li>
<li><a href="#sec-1-4">1.4. 条件判断</a></li>
<li><a href="#sec-1-5">1.5. 循环</a>
<ul>
<li><a href="#sec-1-5-1">1.5.1. for</a></li>
<li><a href="#sec-1-5-2">1.5.2. C风格的for</a></li>
<li><a href="#sec-1-5-3">1.5.3. while</a></li>
<li><a href="#sec-1-5-4">1.5.4. until</a></li>
</ul>
</li>
<li><a href="#sec-1-6">1.6. 函数 function</a>
<ul>
<li><a href="#sec-1-6-1">1.6.1. 输入参数</a></li>
<li><a href="#sec-1-6-2">1.6.2. 输出返回值</a></li>
</ul>
</li>
<li><a href="#sec-1-7">1.7. 用户接口 User Interface</a>
<ul>
<li><a href="#sec-1-7-1">1.7.1. 多选项</a></li>
<li><a href="#sec-1-7-2">1.7.2. 压缩文件</a></li>
</ul>
</li>
<li><a href="#sec-1-8">1.8. Misc 混杂</a>
<ul>
<li><a href="#sec-1-8-1">1.8.1. read 接收用户输入</a></li>
<li><a href="#sec-1-8-2">1.8.2. 数学计算</a></li>
<li><a href="#sec-1-8-3">1.8.3. 查找sh文件</a></li>
<li><a href="#sec-1-8-4">1.8.4. 连接mysql</a></li>
</ul>
</li>
<li><a href="#sec-1-9">1.9. 比较符号</a>
<ul>
<li><a href="#sec-1-9-1">1.9.1. 字符串比较</a></li>
</ul>
</li>
<li><a href="#sec-1-10">1.10. 特殊字符</a>
<ul>
<li><a href="#sec-1-10-1">1.10.1. 运算符需转义</a></li>
</ul>
</li>
<li><a href="#sec-1-11">1.11. 常见问题</a>
<ul>
<li><a href="#sec-1-11-1">1.11.1. 字符串比较</a></li>
</ul>
</li>
<li><a href="#sec-1-12">1.12. Debug</a></li>
<li><a href="#sec-1-13">1.13. 非常有用的命令</a>
<ul>
<li><a href="#sec-1-13-1">1.13.1. find</a></li>
<li><a href="#sec-1-13-2">1.13.2. sed</a></li>
<li><a href="#sec-1-13-3">1.13.3. awk</a></li>
<li><a href="#sec-1-13-4">1.13.4. grep</a></li>
<li><a href="#sec-1-13-5">1.13.5. wc</a></li>
<li><a href="#sec-1-13-6">1.13.6. tput</a></li>
<li><a href="#sec-1-13-7">1.13.7. head</a></li>
<li><a href="#sec-1-13-8">1.13.8. cut</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>



首先各个命令要用的非常的熟练。

## 输入输出<a id="sec-1-1" name="sec-1-1"></a>

stdin，stdout，stderr和C++的函数名是一样的。

## Pipes 管道技术<a id="sec-1-2" name="sec-1-2"></a>

就是一个命令执行完之后会将输出的结果作为下一个命令的输入源。

## 变量<a id="sec-1-3" name="sec-1-3"></a>

弱语言类型的，直接声明。局部变量使用local关键字。
然后记住关键的 $ 符号，可以用来取值，也可以用来执行命令。例子：
STR="Hello World" //规范貌似是变量大写
echo $STR //取值
echo ls //直接打印ls字符串
echo $(ls)  //执行ls命令，并输出

### 变量自增，自减去 ++ --<a id="sec-1-3-1" name="sec-1-3-1"></a>

var=0
var=$((var+1))//很容易知道2个括号里面进行数学运算。
((var=var+1))
((var+=1))
((var++))
或者使用let
let "var=var+1"
let "var+=1"
let "var++"

### $符号<a id="sec-1-3-2" name="sec-1-3-2"></a>

什么时候用括号？执行命令？什么时候不用？取值？
$#    Stores the number of command-line arguments that
were passed to the shell program.
$?    Stores the exit value of the last command that was
executed.
$0    Stores the first word of the entered command (the
name of the shell program).
$\*    Stores all the arguments that were entered on the
command line ($1 $2 &#x2026;).
"$@"  Stores all the arguments that were entered
on the command line, individually quoted ("$1" "$2" &#x2026;).

$$ 输出当前bash所在的pid，就是ps后出现的89933
89933 pts/1    00:00:00 bash
$! 输出当前窗口最后一次使用后台命令启动的进程pid。
$- 不太清楚，反正我打印后输出himBH
$0 输出执行的shell名称。

### 例子<a id="sec-1-3-3" name="sec-1-3-3"></a>

./command -yes -no /home/username
$# = 3
$\* = -yes -no /home/username
$@ = array: {"-yes", "-no", "/home/username"}
$0 = ./command, $1 = -yes etc.

## 条件判断<a id="sec-1-4" name="sec-1-4"></a>

**符号之间一定要用空格分开，不然会出错**
if then else if then else
判断条件要用中括号[]包裹；后面以分号；结尾；
最后一fi结束整个判断语句。
if [ "foo" = "foo" ] ; //分号结束
then
    echo hello foo
fi //结束符

但是好像规范的写法是，将then放在条件判断后。

## 循环<a id="sec-1-5" name="sec-1-5"></a>

感觉我要很好的掌握各种命令啊。
3个关键字：for，while，until。

### for<a id="sec-1-5-1" name="sec-1-5-1"></a>

关键字for do done。
for i in $(ls) ; do //判断语句还是要用分好结束，do关键字执行下一行代码
    echo item: $i  */$不带括号取值
done /* 结束for循环

### C风格的for<a id="sec-1-5-2" name="sec-1-5-2"></a>

for i in \` seq 1 10 \` ; do //这里要用 \` \` ，用逗号的话，会认为是字符串（组成的数组）
    echo $i
done

### while<a id="sec-1-5-3" name="sec-1-5-3"></a>

关键字while，do，let。\*条件判断要用中括号\*
//一个实验性错误
COUNTER = 0  //我草，赋值不能用空格，Linux系统会认为是命令
//那么也就是说很多符号，命令之间要空格，是因为Linux将符号也认为是一种命令？
while [ $COUNTER < 10 ] ; then //then也错了，要用do，只有if采用then？
//<被看做是输出符，找不到10这个文件。我尼玛。也就是shell很傻逼，只会一句句执行。
*/小于号是 -lt
    echo COUNTER is $COUNTER  /*
    COUNTER=$COUNTER-1 */这样赋值不行，减号2边要空格，还是不行。
    let COUNTER=COUNTER+1 /*
done

### until<a id="sec-1-5-4" name="sec-1-5-4"></a>

和while几乎一样，只是条件判断为真后，就会停止执行。

## 函数 function<a id="sec-1-6" name="sec-1-6"></a>

\#!/bin/bash
function quit {
    exit
}

function hello {
    echo Hello!
}
hello
hello
\\#quit
echo foo

### 输入参数<a id="sec-1-6-1" name="sec-1-6-1"></a>

\#带参数的函数，1，2标明第几个参数，从1开始。
function e {
    echo $1
    echo $2
}
e Hello World
quit

函数的调用和java中的方法一样，但是必须在script文件里面调用（外面好像不行啊）。
注释掉quit函数的调用，下面的echo foo会得到执行。不注释掉，就会调用quit后退出。

使用 $\* 接收多个参数。

### 输出返回值<a id="sec-1-6-2" name="sec-1-6-2"></a>

使用$?得到返回值。

## 用户接口 User Interface<a id="sec-1-7" name="sec-1-7"></a>

### 多选项<a id="sec-1-7-1" name="sec-1-7-1"></a>

OPTIONS="Hello Song Exit"
select opt in $OPTIONS ; do
     if [ $opt = "Hello" ] ; then
         echo "Hello Songxin"
     elif [ $opt = "Song" ] ; then
         echo "I love Song"
     elif [ $opt = "Exit" ] ; then
         echo "Sys Exit"
         exit
     else
         clear
         echo "Bad Choose"
     fi
done
//刚开始elif，写成了else if，提示我
./select.sh: line 15: syntax error near unexpected token \`done'
./select.sh: line 15: \`done'
我草，这个else if写错了，为毛说是最后一行有问题。
这里一定要用$OPTIONS取值。
=等于号的问题，这里等于号如果两边没空格的话，就是变成了赋值。

### 压缩文件<a id="sec-1-7-2" name="sec-1-7-2"></a>

\#!/bin/bash
if [ -z "$1" ] ; then
    echo usage: $0 directory
    exit
fi
SRCD=$1
TGTD="*data/howtobash/my<sub>new</sub><sub>dir</sub>*"
OF=home-$(date +%Y%m%d).tgz
tar -czf $TGTD$OF $SRCD

保存为cmline.sh，调用：
./cmline.sh ll.txt
这个shell的意思是：判断没有接收到参数，打印当前命令（$0也就是./cmline.sh）。
取第一个参数，将它打包到TGTD目录下，命名为home-当前日期.tgz的压缩文件。

## Misc 混杂<a id="sec-1-8" name="sec-1-8"></a>

怎么输出!？咦，我草，可以直接放在""外面。
哦，我草，这个感叹号要和""隔离开，比如" ! "这样才能输出 ! 。
Linux的符号一定要多注意，之间用空格，因为很多符号本身就是函数。

### read 接收用户输入<a id="sec-1-8-1" name="sec-1-8-1"></a>

echo Please, enter your name
read NAME
echo "Hello,Nice to meet you, $NAME"!
可以接收多个参数，我草，屌炸天。

### 数学计算<a id="sec-1-8-2" name="sec-1-8-2"></a>

echo 3/4 | bc -l

### 查找sh文件<a id="sec-1-8-3" name="sec-1-8-3"></a>

使用find查找sh文件所在位置
find ./ -name fun.sh
从当前目录递归往下查找fun.sh这个bash。我草，太强大了。

### 连接mysql<a id="sec-1-8-4" name="sec-1-8-4"></a>

\#!/bin/bash
DBS=\`mysql -uestaion  -e"show databases"\`
for b in $DBS
do
    echo $b
    mysql -uestaion  -e"show tables from $b"
done

## 比较符号<a id="sec-1-9" name="sec-1-9"></a>

### 字符串比较<a id="sec-1-9-1" name="sec-1-9-1"></a>

s is not null
s is null
s matches regularExpression
s does not match regularExpression
-n s
-z s //
一个例子：
\\#!/bin/bash
S1='string'
S2='String'
if [ $S1=$S2 ];
then
    echo "S1('$S1') is not equal to S2('$S2')"
fi
if [ $S1=$S1 ];
then
    echo "S1('$S1') is equal to S1('$S1')"
fi
如果s是empty，s=''就会报错：\*
./strcompare.sh: line 4: [: =: unary operator expected
S1('') is equal to S1('')
使用"$s"或者x$s替换掉。

我草$S1=$S2一直都是真，但是不会进行赋值

## 特殊字符<a id="sec-1-10" name="sec-1-10"></a>

\` \` 这个字符好像是执行之间的命令的。
\\ 反斜杠

${} 等同于用$直接取值。
HELLO=hello
echo ${HELLO}wrold //更加有用
helloworld

### 运算符需转义<a id="sec-1-10-1" name="sec-1-10-1"></a>

-lt (<)
-gt (>)
-le (<=)
-ge (>=)
-eq (`=)
    -ne (!`)

## 常见问题<a id="sec-1-11" name="sec-1-11"></a>

### 字符串比较<a id="sec-1-11-1" name="sec-1-11-1"></a>

 unary什么鬼一元，二元比较。
 #!/bin/bash
 if [ $1 = ] ; then
     echo "no params"
     exit 0
fi
如果改成 $1 = "" 那么会报错：
./test.sh: line 2: [: =: unary operator expected
也就是说 $1 取到的值是unary（一元的），因此后面不能用字符串 ""，但是可以用p，c等。

同理，改成 "$1" =  也是不行的，因为前面$1取值后加双引号编程了字符串，是二元的了。
./test.sh: line 2: [: : unary operator expected
可以看到是有不同的，: :是表示等号左边需要一元运算符，而: =: 表示右边需要。
$1这个取值得到的都是传递进去的参数本身，p的话是一元，"p"的话是二元。

草，上面这个都搞错了，这个鸟东西是因为$1取不到值的时候就会报错，传递p，“p”进去其实都可以。

## Debug<a id="sec-1-12" name="sec-1-12"></a>

bash -x xx.bash

## 非常有用的命令<a id="sec-1-13" name="sec-1-13"></a>

### find<a id="sec-1-13-1" name="sec-1-13-1"></a>

### sed<a id="sec-1-13-2" name="sec-1-13-2"></a>

sed  - stream editor for filtering and transforming text
不能改变原文件的内容。
sed 's/China/America/g' dummy.txt > result.txt
将dummy.txt中的China替换成America，然后重定向输出到result.txt中。
**注意** 不能讲dummy.txt重定向到dummy.txt，这样会导致dummy.txt中的内容清空。

更高级的学习方法
首先我用man sed查看sed的说明：流编辑器，用作过滤和转变文本。
那么我们先不看选项，参数。我们先自己来想想，会有哪些选项，参数来支持哪些功能。
过滤：肯定可以得到匹配某些字符串的那些行。也可以用正则表达式。
转变文本：可以将字符串A替换成字符串B；可以去掉符合一定特则的空格，换行等。

然后我文档并没有看懂，但是我依然不去Google，我会 **直接实验** 。
-n 只有匹配并经过特殊处理的哪行才会显示。
nl 显示行数

sed 针对一行只会有效执行一次，比如
echo "one two three,one two three" | sed 's/one/ONE/'
只会替换掉第一个one。

1.  替换 s

    当要替换的字符串中包含特殊字符时，比如要替换/usr/bin为/common/bin
    需要对/进行转义，
    sed 's /\\/user /\\/common '
    或者用下划线\_,大肠符号:,中划线|替换到票。

### awk<a id="sec-1-13-3" name="sec-1-13-3"></a>

awk '/test/{print}' dummy 打印dummy文件中匹配到test的字符串。
awk '/test/{i=i+1} END {print i}' dummy 匹配到dummy中的test，并计算匹配到的总数量

### grep<a id="sec-1-13-4" name="sec-1-13-4"></a>

### wc<a id="sec-1-13-5" name="sec-1-13-5"></a>

### tput<a id="sec-1-13-6" name="sec-1-13-6"></a>

### head<a id="sec-1-13-7" name="sec-1-13-7"></a>

### cut<a id="sec-1-13-8" name="sec-1-13-8"></a>

cut -b 切割，参数接数字
echo 'baz' | cut -b 2
cut -c 切割字符
echo 'baz' | cut -c 2
cut -d 根据指定分割符来切割，参数接切割后的结果集的index，类似java中的split。
echo 'alice,19,beij,girl' |cut -d ',' -f 1,3
输出：alice,beij
echo 'foo' | cut &#x2013;complement -c 1
输出oo
echo 'how;now;brown;cow' | cut -d ';' -f 1,3,4 &#x2013;output-delimiter=' '
替换切割符号，类似java中的replace。
