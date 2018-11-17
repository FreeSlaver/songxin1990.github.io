---
layout: page
breadcrumb: true
title: 异步写日志工具类
category: trash
categoryStr: 废弃
tags: 
keywords: 
description: 
---

<span style="color:red">**废弃**</span><br/>
原因：log4j是有直接提供这种异步写日志的功能的。

一个异步写日志的工具类，对于日志量很大，或者会造成一定响应延时的情况下，就需要使用异步写日志来实现。

简单说下实现的原理：

项目启动的时候，初始化一个日志队列和一个定时线程，定时去扫描这个日志队列中的日志对象，判断日志的类别，分别调用log4j的info,error等方法写日志。

在项目中要写日志的地方就使用LogUtil的静态方法，有info,error等。


具体的参数，比如休眠时间，队列大小，可以自己设置，最好是设置之后进行测试，找出一个均衡点。

工具类

```

public class LogUtil {

    private static int LOG_MQ_LEN;
    private static int LOGUTIL_SLEEP_TIME;
    private static LinkedBlockingDeque<LogMessage> mq;

    public static void init(LogConfig config) {
        LOG_MQ_LEN = config.getLogMqLen();
        LOGUTIL_SLEEP_TIME = config.getLogutilSleepTime();
        mq = new LinkedBlockingDeque<LogMessage>(LOG_MQ_LEN );

        ( new Thread(new Runnable() {
            Logger logger = null;

            @Override
            public void run() {
                LogUtil. info(BootStrap.class, "初始化日志工具类成功!!!" );
                while (!Thread.interrupted()) {
                    LogMessage log = mq.poll();
                    if (null != log) {
                        logger = Logger.getLogger(log.getClazz());
                        if (log.getLevel().equals("debug" )) {
                            logger.debug(log.getMsg());
                            continue;
                        }
                        if (log.getLevel().equals("info" )) {
                            logger.info(log.getMsg());
                            continue;
                        }
                        if (log.getLevel().equals("warn" )) {
                            logger.warn(log.getMsg());
                            continue;
                        }
                        if (log.getLevel().equals("error" )) {
                            logger.error(log.getMsg());
                            continue;
                        }
                    } else {
                        // 避免不断死循环占用CPU
                        try {
                            Thread.sleep(LOGUTIL_SLEEP_TIME);
                        } catch (InterruptedException e) {
                            e.printStackTrace();
                        }
                    }

                }
            }
        })).start();
    }

    public static void error(Class<?> clazz, String msg) {
        LogMessage log = new LogMessage(clazz, "error" , msg);
        mq.offer(log);
    }

    public static void warn(Class<?> clazz, String msg) {
        LogMessage log = new LogMessage(clazz, "warn" , msg);
        mq.offer(log);
    }

    public static void info(Class<?> clazz, String msg) {
        LogMessage log = new LogMessage(clazz, "info" , msg);
        mq.offer(log);
    }

    public static void debug(Class<?> clazz, String msg) {
        LogMessage log = new LogMessage(clazz, "debug" , msg);
        mq.offer(log);
    }

}

```

日志实体类：

```

public class LogMessage implements Serializable {

    private static final long serialVersionUID = 1L;
    private Class<?> clazz;
    private String level;
    private String msg;

    public LogMessage(Class<?> clazz, String level, String msg) {
        this.clazz = clazz;
        this.level = level;
        this.msg = msg;
    }

    public Class<?> getClazz() {
        return clazz ;
    }

    public void setClazz(Class<?> clazz) {
        this.clazz = clazz;
    }

    public String getLevel() {
        return level ;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getMsg() {
        return msg ;
    }

    public void setMsg(String msg) {
        this.msg = msg;
    }
}

```