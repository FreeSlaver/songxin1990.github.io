---
layout: page

title: 对Java程序员最好的学习安卓的方式
category: andriod
tags:
keywords:
description:
---

## 学习方式
  其实我完全，本来不用Google这个答案的，按照老子现在的实力，完全应该知道这个问题。

  很明显，先去Github上Download一个安卓的App Demo然后跑起来，最好这个Demo能包含到安卓常见的一些功能处理。
  比如：如何和HTTP通信，图片处理，应用到各种组件，最佳实践（项目工程该如何搭建，如何调试等），

  然后开始本地调试，先要大概懂，都是些什么意思，然后不动的，看源码，Google，Stack上查询问题，调试。

  公司上班期间无法很明显的，被人看出在搞其他的东西怎么办？但是不能看相关的学习资料吗？哈哈。

  早上起来学习，晚上回去太累？太晚？不用管他们，按时下班就行。

  平时多积累各种组件。

## 安卓学习项目

  https://juejin.im/entry/58ba1cf72f301e006c5f4774

## Mac 安卓 FAQ
### 安装
强烈建议按照此文安装
### mac idea android Unable to locate adb
使用命令行的sdkmanager 安装就好
sdkmanager --install platform-tool
###  安卓模拟器安装哪个好
###  找不到google support
```androiddatabinding
/usr/local/Caskroom/android-sdk/4333796

  Go to the android/ directory of your react-native project
  Create a file called local.properties with this line:

  sdk.dir = /Users/USERNAME/Library/Android/sdk
  Where USERNAME is your OSX username
```