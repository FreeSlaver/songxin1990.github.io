---
layout: page

title: java中获取spring配置的properties文件属性
category: spring
categoryStr: Spring
tags: 
keywords: 
description: 
---


常见的spring项目中，都是通过spring来管理配置文件，我们公司项目配置如下：

```

< bean id= "propertyConfigurer"
  class= "org.springframework.beans.factory.config.PropertyPlaceholderConfigurer" >
	< property name= "fileEncoding" value = "UTF-8" />
	< property name= "locations" >
		< list>
		< value> file:../config/datasource.properties </ value>
		< value> file:../config/redis.properties </ value>
		< value> file:../config/member.properties </ value>
		< value> classpath:/server.properties </ value>
		</ list>
	</ property>
</bean >

```

现在项目的过程当中，想在java代码中获取server.properties中的属性。server.properties文件中内容如下：

```

server.port= 8888
server.id=1

```

获取属性的方式有以下几种：

1. 暴力通过读取文件FileSystem.readFile(xx).get(xx)

2. 通过注解

```

@Value ( "${server.port}")
private int port;

```

这样就把server.port属性注入给了类中的port属性。
稍微好点的自定义一个对应server.properties文件的类，然后使用注解的方式。

```

@Component("ServerProp ")
public class ServerProp{
    @Value("${server.port}")
    private int port;

    @Value("${server.id}")
    private int server.id;
      //get方法
}

```


3. 自定义一个类继承PropertyPlaceholderConfigurer，然后对外提供一个get方法,将spring中配置的PropertyPlaceholderConfigurer
类替换掉。

```

public class CustomizedPropertyPlaceholderConfigurer extends

	PropertyPlaceholderConfigurer {


	private static Map<String, Object> ctxPropertiesMap;


	@Override
	protected void processProperties(

		ConfigurableListableBeanFactory beanFactoryToProcess,
		
		Properties props) throws BeansException {

		super.processProperties(beanFactoryToProcess, props);

		ctxPropertiesMap = new HashMap<String, Object>();

		for (Object key : props.keySet()) {

			String keyStr = key.toString();
		
			String value = props.getProperty(keyStr);

			ctxPropertiesMap.put(keyStr, value);

		} 

	}

	public static Object getContextProperty(String name) {

		return ctxPropertiesMap.get(name);
	}
}

```



