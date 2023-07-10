---
layout: page

title: Git常用命令 教程总结
category: ops
categoryStr: 运维监控
tags: [git,command]
keywords: git,command,命令,教程
description: Git常用命令，教程总结
---


### 设置用户名和密码
git config --global user.name "songxin1990"
git config --global user.email "504252262@qq.com"
--global参数表明这台机器上所有的GIT仓库都会使用这个配置。
好像是不带这个global参数就是针对单独项目的。
创建SSH KEY
ssh-keygen -t rsa -C "504252262@qq.com"
id_rsa是私匙，不能泄露，id_rsa.pub是公匙。

### 初始化仓库
git init

### 删除仓库.git文件
rm -rf .git

### 禁用自动转换
git config --global core.autocrlf false

### 添加文件
git add readme.txt（把文件添到暂存区）

### 提交文件到仓库
git commit -m "add sth"
-m参数表示本次的提交说明。

### 查看状态
git status

### 查看差异
git diff readme.txt

### 查看工作区和版本库最新版本的区别
git diff HEADE --readme.txt

### 丢弃工作区修改
git checkout --readme.txt
让文件回到最近一次git commit或git add时的状态。
其实是用版本库中的版本替换工作区的版本。

### 丢弃暂存区修改
git reset HEAD readme.txt

###查看历史记录
git log --pretty=online
显示从最近到最远的日志。

### 回退版本(没有提交到远程库)
git reset --hard HEAD^
上一个版本就是HEAD^，前100个版本就是HEAD~100
回退之后(未来的就丢失了)再回去未来就是
git reset --hard commitid(需要知道commit id，很重要)
如果不知道commit id,使用git reflog查看你的每一次命令

### 查看命令记录
git reflog

### 查看文件内容
cat readme.txt

### 创建远程仓库
git remote add origin git@github.com:songxin1990/learngit.git

### 推送本地库到远程库
git push -u origin master
-u参数不但会把本地推倒远程，还会把本地master和远程master分支关联。
以后使用
git push orgin master

### 克隆远程库到本地
git clone git@github.com:songxin1990/learngit.git
还可以使用https协议，https://github.com/songxin1990/learngit.git
https的速度慢，每次都需要输入口令。
默认的是git://是使用的ssh

### 分支的概念
假设你准备开发⼀一个新功能，但是需要两周才能完成，第⼀一周你
写了50%的代码，如果⽴立刻提交，由于代码还没写完，不完整的代码库会导致别⼈人不能干活
了。如果等代码全部写完再⼀一次提交，⼜又存在丢失每天进度的巨⼤大⻛风险。
现在有了分⽀支，就不⽤用怕了。你创建了⼀一个属于你⾃自⼰己的分⽀支，别⼈人看不到，还继续在原来
的分⽀支上正常⼯工作，⽽而你在⾃自⼰己的分⽀支上干活，想提交就提交，直到开发完毕后，再⼀一次性
合并到原来的分⽀支上，这样，既安全，⼜又不影响别⼈人⼯工作。

### 创建与合并分支
主分支就是master分支。
HEAD严格来说指向的是master，不是指向提交，master才是指向提交的。
所以HEAD指向的就是当前分支。HEAD-->MASTER-->最新提交

### 创建dev分支
git checkout -b dev
-b参数表示创建并切换。
相当于
git branch dev
git checkout dev

### 查看当前分支
git branch
会列出所有分支，当前分支前面有*号。

### 查看映射关系
git branch -vv

如果只想用git pull，可能需要建立track关系，则使用
git branch  --set-upstream-to=origin/<远端branch_name> <本地branch_name>

### 切换分支
git checkout master(分支名)

### 合并分支
git merge dev（合并指定分支到当前分支）
先切换到master，然后输入命令，就是将dev的分支合并到master的分支上。



### 删除分支
git branch -d dev
GIT鼓励大量使用分支完成任务，然后删除掉分支
### 删除远程分支
git push origin --delete branchName

### 解决冲突
手动修改文件。
<<<<<<< HEAD
Creating a new branch is quick & simple.
=======
Creating a new branch is quick AND simple.
>>>>>>> feature1
当前HEAD（因为是在master分支下）指向Creating a new branch is quick & simple.
Creating a new branch is quick AND simple.指向分支feature1。
中间用=======隔开。
git log --graph查看分支合并图

Fast forward模式会丢掉分支信息。
使用--no-ff方式的merge
git merge --no--f -m "merge with no-ff" dev
--no-ff表示禁用fast forward
但是会创建一个新的commit，所以加上-m描述信息。

### 分支管理
团队合作模式的分支
•master分⽀支是主分⽀支，因此要时刻与远程同步；
• dev分⽀支是开发分⽀支，团队所有成员都需要在上⾯面⼯工作，所以也需要与远程同步；
• bug分⽀支只⽤用于在本地修复bug，就没必要推到远程了，除⾮非⽼老板要看看你每周到底
修复了⼏几个bug；
• feature分⽀支是否推到远程，取决于你是否和你的⼩小伙伴合作在上⾯面开发。

因此，多人协作的工作模式通常是这样：
1. 首先，可以试图用 git push origin branch-name 推送自己的修改；
2. 如果推送失败，则因为远程分支比你的本地更新，需要先用 git pull 试图合并；
3. 如果合并有冲突，则解决冲突，并在本地提交；
4. 没有冲突或者解决掉冲突后，再用 git push origin branch-name 推送就能成功！

如果 git pull 提示“no tracking information”，则说明本地分支和远程分支的链接关系没
有创建，用命令 git branch --set-upstream branch-name origin/branch-name 。

### 抓取分支
Git已经提示我们，先用git pull把最新的提交从origin/dev抓下来，然后，在本地合并，解
决冲突，再推送：
本地和远程分⽀支的名称最好一致；

设置本地和远程的链接
git branch --set-upstream dev origin/dev
git pull

### Bug分支
每个bug都可以通过一个新的临时分支来修复

### 存储工作现场
git stash(保存当前工作现场)
git stash list（列出保存的工作现场）
git stash apply(恢复工作现场但不删除)
git stash drop(删除工作现场)
git stash pop(恢复并删除)

### 查看远程库信息
git remote -v

### 创建标签
git tag v1.0 commitid
默认标签是打在最新提交的commit上的，也就是没commitid参数。
git show v1.0（查看标签信息）
标签不是按时间排序，而是按字母
git tag -a v0.1 -m "some desc" 3628164
创建带有说明的标签，-a指定标签名，-m指定说明文字。
$ git tag -s v0.2 -m "signed version 0.2 released" fec145a
-s参数用私匙签名一个标签。PGP签名

## 操作标签
### 删除本地标签
git tag -d v0.1
删除远程标签
先删除本地的，
然后删除远程的
git push origin :refs/tags/v0.9

### 推送标签到远程
git push origin tagname

git push origin --tags（一次性推送）

### 参与开源项目
1.找到项目主页
2.点击Fork,就在最近账号下克隆了一个bootstrap仓库，
3.从自己的账号下clone(一定要)
git clone git@github.com:songxin1990/bootstrap.git
4.在本地干活，push到自己的仓库
5.发起一个pull request.

### 忽略特殊文件
把忽略的文件名填到.gitignore文件。
直接可用的配置文件https://github.com/github/gitignore
忽略⽂文件的原则是：
1. 忽略操作系统⾃自动⽣生成的⽂文件，⽐比如缩略图等；
2. 忽略编译⽣生成的中间⽂文件、可执⾏行⽂文件等，也就是如果⼀一个⽂文件是通过另⼀一个⽂文件⾃自
动⽣生成的，那⾃自动⽣生成的⽂文件就没必要放进版本库，⽐比如Java编译产⽣生的.class⽂文
件；
3. 忽略你⾃自⼰己的带有敏感信息的配置⽂文件，⽐比如存放⼝口令的配置⽂文件。

最后⼀一步就是把.gitignore也提交到Git，就完成了！当然检验.gitignore的标准是 git status
命令是不是说“working directory clean"。

### 配置命令别名
git config --global alias.st status

### 搭建Git服务器
参看文档

### 获取主干最新代码
git checkout master
git pull

### 新建一个名为myfeature的开发分支
git checkout -b myfeature

### 提交分支
git add --all(也可以git add .     保存所有变化，新建，修改，删除)

git status（查看发送变动的文件）

git commit --verbose（列出diff的结果）

### 撰写提交信息
第一行不超过50字的提要，然后空一行，罗列改动原因。

### 与主干同步
git fetch origin

git rebase origin/master

### 合并commit？？？
git rebase -i origin/master

### 推送到远程
git push --force origin myfeature
因为rebase以后，分支历史改变，跟远程不一定兼容，有可能要强行推送

发出pull request


