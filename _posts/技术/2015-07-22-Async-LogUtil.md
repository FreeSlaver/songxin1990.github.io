---
layout: post
title: 异步写日志工具类
category: 技术
tags: Log MQ
keywords: 
description: 
---

一个异步写日志的工具类，对于日志量很大，或者会造成一定响应延时的情况下，就需要使用异步写日志来实现。

具体的参数，比如休眠时间，队列大小，可以自己设置，最好是设置之后进行测试，找出一个均衡点。

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