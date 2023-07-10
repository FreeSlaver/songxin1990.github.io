---
layout: page

title: Autowire注解是在Spring生命周期的哪一步运行的？
category: spring
categoryStr: Spring
tags:
keywords:
description:
---


实现@Autowired 的关键是：AutowiredAnnotationBeanPostProcessor

在 Bean 的初始化阶段，会通过 Bean 后置处理器来进行一些前置和后置的处理。

实现@Autowired 的功能，也是通过后置处理器来完成的。这个后置处理器就是 AutowiredAnnotationBeanPostProcessor。

Spring 在创建 bean 的过程中，最终会调用到 doCreateBean()方法，在 doCreateBean()方法中会调用 populateBean()方法，来为 bean 进行属性填充，完成自动装配等工作。

在 populateBean()方法中一共调用了两次后置处理器，第一次是为了判断是否需要属性填充，如果不需要进行属性填充，那么就会直接进行 return，

如果需要进行属性填充，那么方法就会继续向下执行，后面会进行第二次后置处理器的调用，

这个时候，就会调用到 AutowiredAnnotationBeanPostProcessor 的 postProcessPropertyValues()方法，在该方法中就会进行@Autowired 注解的解析，然后实现自动装配。

```java
/**
* 属性赋值
**/
protected void populateBean(String beanName, RootBeanDefinition mbd, @Nullable BeanWrapper bw) {
          //…………
          if (hasInstAwareBpps) {
              if (pvs == null) {
                  pvs = mbd.getPropertyValues();
              }

              PropertyValues pvsToUse;
              for(Iterator var9 = this.getBeanPostProcessorCache().instantiationAware.iterator(); var9.hasNext(); pvs = pvsToUse) {
                  InstantiationAwareBeanPostProcessor bp = (InstantiationAwareBeanPostProcessor)var9.next();
                  pvsToUse = bp.postProcessProperties((PropertyValues)pvs, bw.getWrappedInstance(), beanName);
                  if (pvsToUse == null) {
                      if (filteredPds == null) {
                          filteredPds = this.filterPropertyDescriptorsForDependencyCheck(bw, mbd.allowCaching);
                      }
                      //执行后处理器，填充属性，完成自动装配
                      //调用InstantiationAwareBeanPostProcessor的postProcessPropertyValues()方法
                      pvsToUse = bp.postProcessPropertyValues((PropertyValues)pvs, filteredPds, bw.getWrappedInstance(), beanName);
                      if (pvsToUse == null) {
                          return;
                      }
                  }
              }
          }
         //…………
  }

```

postProcessorPropertyValues()方法的源码如下，

在该方法中，会先调用 findAutowiringMetadata()方法解析出 bean 中带有@Autowired 注解、@Inject 和@Value 注解的属性和方法。

然后调用 metadata.inject()方法，进行属性填充。
```java

public PropertyValues postProcessProperties(PropertyValues pvs, Object bean, String beanName) {
        //@Autowired注解、@Inject和@Value注解的属性和方法
        InjectionMetadata metadata = this.findAutowiringMetadata(beanName, bean.getClass(), pvs);

        try {
        //属性填充
        metadata.inject(bean, beanName, pvs);
        return pvs;
        } catch (BeanCreationException var6) {
        throw var6;
        } catch (Throwable var7) {
        throw new BeanCreationException(beanName, "Injection of autowired dependencies failed", var7);
        }
        }

```

