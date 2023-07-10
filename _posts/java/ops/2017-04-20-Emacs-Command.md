---
layout: page

title: Emacs 常用命令
category: ops
categoryStr: 运维监控
tags: [emacs,command]
keywords: emacs,command 命令
description:
---


## 移动<a id="sec-1-1" name="sec-1-1"></a>

### 字符：<a id="sec-1-1-1" name="sec-1-1-1"></a>

Del 删除光标前的一个字符  
C-d 删除光标后的一个字符  

### 单词：<a id="sec-1-1-2" name="sec-1-1-2"></a>

使用M-？ 

### 行：<a id="sec-1-1-3" name="sec-1-1-3"></a>

M-a 上一句  
M-e 下一句  

### 标记及快速移动<a id="sec-1-1-4" name="sec-1-1-4"></a>

C-x C-x  
选中当前光标和上个光标间的内容。  
C-u C-SPC  
mark中循环遍历，也就是不断返回到之前光标所在位置。  

### 多次操作<a id="sec-1-1-5" name="sec-1-1-5"></a>

C-u 3 C-p 后移3行  
M-g g 15 调到指定行  
未指定数字，默认是4  

## 复制粘贴：<a id="sec-1-2" name="sec-1-2"></a>

C-x h 全选  
C-w 剪切选中区域（默认是当前光标所在行）  
被移除的东西可以找回，被删除的不行。  

## 文件：<a id="sec-1-3" name="sec-1-3"></a>

Dired能够列出所有文件，然后进行文件的移动，访问，重命名，删除等。  
C-x d或者M-x dired调用Dired，然后C-k删除，r重命名，d标记删除，还有diff等  
C-x C-b 列出缓冲区  
C-x b +缓冲区名字 打开缓冲区。  
C-x s 保存多个缓冲区  
C-c 复制文件  
C-x C-w 文件重命名  
操作文件时使用\*进行匹配  
M-x recover file 从#xx#中恢复文件  
M-x make-directory 创建文件夹

C-home 跳到文件开头(M-<)  
C-end 跳到文件尾部(M->)  

替换M-x replace-string

## buffer相关：<a id="sec-1-4" name="sec-1-4"></a>

M-x erase-buffer 清空buffer  

## 整体操作<a id="sec-1-5" name="sec-1-5"></a>

fg或%emacs 再次回到Emacs，windows下无效  

## Emacs模式<a id="sec-1-6" name="sec-1-6"></a>

M-x text mode 切换到text模式。  
M-v 上一屏幕  
M-< buffer开头，好像还可以跳到上一个mark 
M-> buffer结尾  

## 搜索<a id="sec-1-7" name="sec-1-7"></a>

C-r 增量向后搜索  

## 日历<a id="sec-1-8" name="sec-1-8"></a>

M-x calender 调用日历功能  
C-u M-x calender 会提示  
C-x编辑相关的  

通常的惯例是：META 系  
列组合键用来操作“由语言定义的单位（比如词、句子、段落）”，而 CONTROL  
系列组合键用来操作“与语言无关的基本单位（比如字符、行等等）”。  

以 CONTROL-x 开始的，这些命令许多都跟“窗格、文件、  
缓冲区【缓冲区（buffer）会在后文详细介绍】”等等诸如此类的东西有关  

主模式和辅模式  
一个主模式可以同时有多个辅模式。  
M-x auto-fill-mode 启动自动折行模式，已启动的会关闭。  
C-x f 修改每行的字符数，默认是70个。使用方式C-u 20 C-x f  
M-q 手动这行。重新设置折行之后对段落无效，需要手动设置折行。  

## 窗口windows<a id="sec-1-9" name="sec-1-9"></a>

C-M-v 向下滚动下方窗格，但是好像没效果啊。ESC C-v这个可以。  
C-M-S-V 向上滚动下方窗格  
C-x o 将光标移动到其他窗格。  
Ctrl Alt Shift等都是修饰键（modifier key），ESC只是一个字符。  
C-x 4 C-f 在下方新窗口中打开文件  
M-x make-frame 新建一个窗口  

## 关闭离开<a id="sec-1-10" name="sec-1-10"></a>

ESC ESC ESC 是最通用的离开命令，关掉多余窗格，离开小缓冲  
不能使用C-g退出递归编辑，C-g的作用是取消本层递归编辑之内的命令和参数。  

## 帮助：<a id="sec-1-11" name="sec-1-11"></a>

C-h 加一个字符说明你需要说明帮助。  
C-h r 阅读Emacs手册  
C-h t 获取Emacs教程  
C-h i浏览手册  
F10或ESC或M-激活菜单栏  
C-x c-q 切换到可用编辑模式  
F1或者M-x help也行。  
比如C-h c C-p 提示runs the command previous-line。previous-line是函数名，  

C-h k C-p 会打开一个窗格显示函数名称以及文档。  
C-h f 解释一个函数，如：C-h prvious-line  
C-h v 显示变量文档。  
C-h a 相关命令搜索，使用M-x来启动。  
C-h i 阅读手册  

## 插件：<a id="sec-1-12" name="sec-1-12"></a>

M-x package-install xx 安装xx插件  
M-x package-refresh-contents  

## 编码：<a id="sec-1-13" name="sec-1-13"></a>

M-x describe-current-coding-system 查看当前文件的编码  
C+x ret r utf-8 ret 以utf8打开文件  
M-x revert-buffer-with-coding-system 选择utf8，设置文件编码为utf8  
M-x set-buffer-file-coding-system 保存文件时设置编码  
 
;; UTF-8 settings   
(set-language-environment "UTF-8")   
(set-terminal-coding-system 'utf-8)  
(set-keyboard-coding-system 'utf-8)  
(set-clipboard-coding-system 'utf-8)  
(set-buffer-file-coding-system 'utf-8)  
(set-selection-coding-system 'utf-8)  
(modify-coding-system-alist 'process "\*" 'utf-8)  
上面的命令一个个敲  

## 常见问题：<a id="sec-1-14" name="sec-1-14"></a>

M-x table-insert 插入表格  
