---
layout: page

title: 实现一个自定义的Spring AOP
category: spring
categoryStr: Spring
tags: [interview]
keywords:
description:
---


## 引入依赖：引入 AOP 依赖
```xml
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-aop</artifactId>
        </dependency>


```
## 自定义注解：自定义一个注解作为切点
```java
@Retention(RetentionPolicy.RUNTIME)
@Target({ElementType.METHOD})
@Documented
public @interface WebLog {
}


```
## 配置 AOP 切面：

@Aspect：标识切面

@Pointcut：设置切点，这里以自定义注解为切点，定义切点有很多其它种方式，自定义注解是比较常用的一种。

@Before：在切点之前织入，打印了一些入参信息

@Around：环绕切点，打印返回参数和接口执行时间
```java
@Aspect
@Component
public class WebLogAspect {

    private final static Logger logger         = LoggerFactory.getLogger(WebLogAspect.class);

    /**
     * 以自定义 @WebLog 注解为切点
     **/
    @Pointcut("@annotation(cn.fighter3.spring.aop_demo.WebLog)")
    public void webLog() {}

    /**
     * 在切点之前织入
     */
    @Before("webLog()")
    public void doBefore(JoinPoint joinPoint) throws Throwable {
        // 开始打印请求日志
        ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        HttpServletRequest request = attributes.getRequest();
        // 打印请求相关参数
        logger.info("========================================== Start ==========================================");
        // 打印请求 url
        logger.info("URL            : {}", request.getRequestURL().toString());
        // 打印 Http method
        logger.info("HTTP Method    : {}", request.getMethod());
        // 打印调用 controller 的全路径以及执行方法
        logger.info("Class Method   : {}.{}", joinPoint.getSignature().getDeclaringTypeName(), joinPoint.getSignature().getName());
        // 打印请求的 IP
        logger.info("IP             : {}", request.getRemoteAddr());
        // 打印请求入参
        logger.info("Request Args   : {}",new ObjectMapper().writeValueAsString(joinPoint.getArgs()));
    }

    /**
     * 在切点之后织入
     * @throws Throwable
     */
    @After("webLog()")
    public void doAfter() throws Throwable {
        // 结束后打个分隔线，方便查看
        logger.info("=========================================== End ===========================================");
    }

    /**
     * 环绕
     */
    @Around("webLog()")
    public Object doAround(ProceedingJoinPoint proceedingJoinPoint) throws Throwable {
        //开始时间
        long startTime = System.currentTimeMillis();
        Object result = proceedingJoinPoint.proceed();
        // 打印出参
        logger.info("Response Args  : {}", new ObjectMapper().writeValueAsString(result));
        // 执行耗时
        logger.info("Time-Consuming : {} ms", System.currentTimeMillis() - startTime);
        return result;
    }

}

```
## 使用
```java
    @GetMapping("/hello")
    @WebLog(desc = "这是一个欢迎接口")
    public String hello(String name){
        return "Hello "+name;
    }

```
## 结果
