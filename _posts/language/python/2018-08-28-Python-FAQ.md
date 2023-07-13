---
layout: page

title: Python FAQ 常见问题答疑
category: python
tags:  [faq]
keywords:
description:
---


## python vritual Environments
### pipevn
使用pip安装东西。  
pip install --user pipenv

查看python执行路径  
python -m site --user-base

mac目录  
/Users/songxin/Library/Python/2.7/bin

配置path在mac的~/.bash_profile里面之后就能使用pipenv了。
pipenv是用来管理单个项目的依赖的。

然后执行命令的时候，要这样，感觉不太友好啊！  
pipenv run python main.py
### virtualenv
类似java用的maven啊，就是一个依赖管理工具，里面有很多python包。
不对。

应该就是单独为这个项目搞了一个python和pip环境。  
virtualenv my_project

默认是2.7的，可以设置：  
virtualenv -p /usr/bin/python3.7 my_project

使用虚拟环境前，先激活  
source my_project/bin/activate
关闭虚拟环境  
deactivate

删除虚拟环境，直接删除文件夹my_project  
获取当前环境的依赖列表：  
pip freeze > requirements.txt
直接安装相同的包依赖  
pip install -r requirements.txt
### virtualenvwrapper
默认是搞到~/.local撒的下面，
创建一个虚拟环境，这个貌似依赖WORKON_HOME，
$ mkvirtualenv my_project  

在虚拟环境上工作：
$ workon my_project  

创建项目：需要先设置PROJECT_HOME
mkproject myproject   

停止是一样的：
$ deactivate  
删除：  
$ rmvirtualenv my_project
### virtualenv-burrito
brew install autoenv
当您 cd 进入一个包含 .env 的目录中，就会 autoenv 自动激活那个环境。
## python常用语法
### 特殊符号
;估计是认为结束符
### 发送http
```python
import requests
response = request.get(url)
print(response);
```
### 格式化json
response.json()
### 从json中取出元素，其实也就是从map中取元素
response.json()['origin']
### 遍历
for x in arr
    print(x)
### 文件读取到字符串
content = open(your_file).readlines()
### 字符串是否在文件中
```python
if 'balana' in open('example.txt').read():
    print('true')    
```
## python乱码
   使用codecs这个包。
## 查询manu，官方doc，github这些才是正确的学习方式
## 注意事项
   app = Flask(__name__)
   这里他妈的都是2个下划线。

   from + import来导入包中的部分模块。
### 源文件里面有中文字符
   第一行添加# -*- coding: UTF-8 -*-
### 读取yaml成为dict
   pip search yaml
   pip install pyyaml
### mac os
```bash
brew install libyaml
sudo python -m easy_install pyyaml
```

That's Really Cool.
## 简明python笔记
   如果要让内部属性不被外部访问，可以把属性的名称前加上两个下划线__，在Python中，实例的变量名如果以__开头，就变成了一个私有变量（private），  
   只有内部可以访问，外部不能访问， 变量名类似__xxx__的，也就是以双下划线开头，并且以双下划线结尾的，是特殊变量， 特殊变量是可以直接访问的，不是private变量，  
   _name按照约定俗成的规定，当你看到这样的变量时，意思就是，“虽然我可以被访问，但是，请把我视为私有变量，不要随意访问”。  
   不能直接访问__name是因为Python解释器对外把__name变量改成了_Student__name，所以，仍然可以通过_Student__name来访问__name变量：  
   bart.__name = 'New Name',外部代码给bart新增了一个__name变量。   

   class Dog(Animal):  
   这样继承，所有的都继承于Object。

   我们来判断对象类型，使用type()函数，type(dog) 

   如果要获得一个对象的所有属性和方法，可以使用dir()函数，它返回一个包含字符串的list，

   class Student(object):   
   name = 'Student'#类属性  

正常情况下，当我们定义了一个class，创建了一个class的实例后，我们可以给该实例绑定任何属性和方法，这就是动态语言的灵活性。
