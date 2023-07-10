---
layout: page

title: jgit 权限及个人化的Twitter
category: webmaster
categoryStr: 网站建设
tags: [jgit,twitter]
keywords: jgit,
description: 
---


从来不玩微博，也不玩Twitter，虽然都有注册。而且微信朋友圈也关闭了很长一段时间了。  
一方面不想被别人各种脑残的刷存在感行为打扰，另外一方面朋友圈也不适合我这么富有哲理的人，  
因此就自己打了个类Twitter的系统，整合到了这个以Github Pages，Jekyll为基础的个人博客中。  
具体效果就在关于我目录下的语录啊，心情啊等页面。  

## 具体实现<a id="sec-1-1" name="sec-1-1"></a>

首先我不想引入对外部系统的依赖，一方面是为了产品的完整性，另一方面后续迁移，导出等等都会更方便。  
自己用java搞了个后台程序，然后VPS上拉了一份此博客对应的git项目，然后由后台来调用Git服务。  
java这边使用的是jgit，主要是在权限这方面卡主了。  

jgit可以使用HTTPS和SSH的方式来进行pull，commit等操作，但是HTTPS必须要提供账号和密码，  
我在使用ssh生成密匙后，并将public key添加到Github后台时，每次直接命令行操作，都提示我要输入账号和密码，  
原来是因为我拉取项目时使用的HTTPS的方式，虽然可以通过命令：  
git config --global credential.helper store  
解决掉，但是在用jgit提交的时候还是会报错。必须得在代码中指定账号和密码。  
这个太危险了，所以我就转换成jgit ssh的方式提交，但是运行后，会报错，  
Transport Http cannot be cast to org.eclipse.jgit.transport.SshTransport  
很明显的提示：HTTP传输无法转换成SSH传输。  

所以拉取项目时候，最好用SSH方式拉取。  
具体代码如下，方便复制黏贴的同学。
```java

public class GitUtil {
    private static Git git = null;

    public static void commitBySSHKey(String gitRepositoryPath, String comment){
        SshSessionFactory factory = new JschConfigSessionFactory() {
            @Override
            protected void configure(OpenSshConfig.Host hc, Session session) {
            }
        };
        TransportConfigCallback transportConfigCallback = new TransportConfigCallback() {
            @Override
            public void configure(Transport transport) {
                SshTransport sshTransport = (SshTransport)transport;
                sshTransport.setSshSessionFactory(factory);
            }
        };
        Git git = null;
        try {
            Repository existingRepo = new FileRepositoryBuilder()
                    .setGitDir(new File(gitRepositoryPath + "/.git"))
                    .build();
            git = new Git(existingRepo);

            PullCommand pullCommand = git.pull();
            pullCommand.setTransportConfigCallback(transportConfigCallback);
            pullCommand.call();
            //true if no differences exist between the working-tree, the index, and the current HEAD, false if differences do exist
            if (git.status().call().isClean() == true) {
                log.info("\n-------code is clean------");
                System.out.println("\n-------code is clean------");
            } else {  //clean
                git.add().addFilepattern(".").call();

                String timeSuffix = DateFormatUtils.format(new Date(), "yyyy-MM-dd");

                git.commit().setMessage(timeSuffix + " " + comment).call();
                PushCommand pushCommand = git.push();
                pushCommand.setTransportConfigCallback(transportConfigCallback);
                pushCommand.call();
                log.info("------succeed add,commit,push files . to repository at "
                        + existingRepo.getDirectory());
            }
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        } catch (GitAPIException e) {
            log.error(e.getMessage(), e);
        } finally {
            if (git != null) {
                git.close();
            }
        }
    }

    public static void commitByPwd(String gitRepositoryPath, String comment) {
        Git git = null;
        try {
            Repository existingRepo = new FileRepositoryBuilder()
                    .setGitDir(new File(gitRepositoryPath + "/.git"))
                    .build();
            git = new Git(existingRepo);
            CredentialsProvider cp = null;
            git.pull().setCredentialsProvider(cp);

            //true if no differences exist between the working-tree, the index, and the current HEAD, false if differences do exist
            if (git.status().call().isClean() == true) {
                log.info("\n-------code is clean------");
                System.out.println("\n-------code is clean------");
            } else {  //clean
                git.add().addFilepattern(".").call();

                String timeSuffix = DateFormatUtils.format(new Date(), "yyyy-MM-dd");

                git.commit().setMessage(timeSuffix + " " + comment).call();
                git.push().setCredentialsProvider(cp).call();
                log.info("------succeed add,commit,push files . to repository at "
                        + existingRepo.getDirectory());
            }
        } catch (IOException e) {
            log.error(e.getMessage(), e);
        } catch (GitAPIException e) {
            log.error(e.getMessage(), e);
        } finally {
            if (git != null) {
                git.close();
            }
        }
    }
}


```
