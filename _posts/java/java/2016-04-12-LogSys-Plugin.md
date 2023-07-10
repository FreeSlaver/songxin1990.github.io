---
layout: page

title: 日志系统handler之日志清洗插件热插播的实现
category: java
categoryStr: java
tags: 
keywords: 
description: 
---

### 首先我们有一个Plugin接口：

```

public interface Plugin {
  //获取日志类型
  public String getPBType();
  //获取日志处理器
  public Processor getProcessor();
  //获取输出到ES实现
  public Output getOutput();
}

```


### 还有一个Adaptor

可以从Adaptor中根据日志类型选取不同的Processor对日志进行处理，以及Outputer对日志结果进行输出。

```

public class Adaptor {

    private Logger LOG = Logger.getLogger( Adaptor.class);

    private String pbType;

    private Processor processor;

    private Output output;

    public Adaptor(Plugin plugin) {
        this.pbType = plugin.getPBType();
        this.processor = plugin.getProcessor();
        this.output = plugin.getOutput();
    }

    public Adaptor(String pbType, Processor processor, Output output) {
        this.pbType = pbType;
        this.processor = processor;
        this.output = output;
    }

    public String getPbType() {
        return pbType ;
    }

    public void setPbType(String pbType) {
        this.pbType = pbType;
    }

    public CommonLogPojo run(CommonLogPojo pojo) {
        if (null == pojo) {
            return null ;
        }
        CommonLogPojo result = pojo;
        try {
            result = processor.execute(result);
            LOG.debug("processor data-->" + result.getData());
            result = output.execute(result);
        } catch (Exception e) {
            BasicMonitor.addErrMetric(pojo.getPb_type());
            BasicMonitor.addErrMetric("monitor");
            LOG.warn("pb_type:" + getPbType() + "，["+ JSON.toJSONString(pojo)+"]Adaptor处理异常, " + ESUtil.printStackTraceToString(e));
           
            DeplogVO vo = new DeplogVO();
            vo.setPbType(pojo.getPb_type());
            vo.setMessage("[" +JSON.toJSONString(pojo)+ "]Adaptor处理异常, " + ESUtil.printStackTraceToString (e));
            LogUtils. warn(vo);
        }
        return result;
    }
}

```

### 还有一个Selector

当日志来了之后，我们使用Selector根据日志类型从adaptorMap中选取不同的Adaptor。

```

public class Selector {

     // selector是来通知adaptor的，然后adaptor来遍历list，处理
     private static Map<String, Adaptor> adaptorMap;

     public static Adaptor select(CommonLogPojo pojo) {
           // 1.判断pojo
           if (null == pojo) {
               return null ;
          }
           // 2.获取Adaptor
           return selecotr .get(pojo.getPb_type());
     }

     public static void init(Map<String, Adaptor> map) {
           selecotr = map;
     }
}

```

### 还有一个PluginManager

在项目启动的时候，我们调用它的registerPlugin方法，去扫描com.bd.log.pb这个package下的java类，并遍历子package。

如果是文件类型的，会去扫描class文件，如果是jar类型的，会使用jar类型的扫描策略。

然后对包下的文件名进行匹配，通过反射得到实例。

文件的：

```

for (File pbFile : pbFiles) {
	 if (pbFile.getName().endsWith(".class" ) && pbFile.getName().indexOf("$" )<0) {
	     String className = pbFile.getName().substring(0, pbFile.getName().length() - 6);
	      try {
		  Object obj = Class.forName(packageName + "." + file.getName() + '.' + className)
			   .newInstance();
		   if (obj instanceof Plugin) {
		      plugin = (Plugin) obj;
			LOG.info(obj.getClass().getName());
		       LogUtils. info(obj.getClass().getName());
		  }
	     } catch (Exception e) {
		   LOG.error("扫描Plugin异常" +e.getMessage());
		  LogUtils. error("扫描Plugin异常"+e.getMessage());
	     }
	}
   }
    if (plugin != null) {
    Adaptor adapter = new Adaptor(plugin);
    adaptorMap.put(plugin.getPBType(), adapter);
}

```

Jar文件的：

```

if (name.startsWith(packageDirName) && name.endsWith(".class" )&& name.indexOf( "$")<0) {
  Plugin plugin = null;
  String className = name.replace('/' , '.' ).substring(0, name.length() - 6);
  Class<?> classz = Class.forName(className);
  if (!Modifier.isInterface(classz.getModifiers())) {
	Object obj = classz.newInstance();
	 if (obj instanceof Plugin ){
		plugin = ( Plugin) obj;
		LOG .info(obj.getClass().getName());
	}
  }
  if (plugin != null) {
	Adaptor adapter = new Adaptor(plugin);
	adaptorMap .put(plugin.getPBType(), adapter);
	}
  }

```

然后将实现Plugin接口的实例包装到Adaptor中，之后将Adaptor的实例放到一个adaptorMap中，并将adaptorMap 注入到Selector中。

Selector. init( adaptorMap);


PluginManager的具体代码如下：

```

public class PluginManager {
    private static Logger LOG = Logger.getLogger(PluginManager.class);

    public final static String scanPackageClassName = "com.bd.log.pb";
    private static Map<String, Adaptor> adaptorMap = new HashMap<String, Adaptor>();

    /**
     * 注册Plugin
     * 
     */
    public static void registerPlugin() {
        LOG.info("开始注册Plugin");
        LogUtils.info("开始注册Plugin");
        // 是否循环迭代
        boolean recursive = true;
        // 获取包的名字 并进行替换
        String packageDir = scanPackageClassName;
        String packageDirName = packageDir.replace('.', '/');
        // 定义一个枚举的集合 并进行循环来处理这个目录下的things
        Enumeration<URL> dirs;
        try {
            dirs = Thread.currentThread().getContextClassLoader().getResources(packageDirName);
            // 循环迭代下去
            while (dirs.hasMoreElements()) {
                // 获取下一个元素
                URL url = dirs.nextElement();
                // 得到协议的名称
                String protocol = url.getProtocol();
                // 如果是以文件的形式保存在服务器上
                if ("file".equals(protocol)) {
                    LOG.info("file类型的扫描");
                    LogUtils.info("file类型的扫描");
                    String filePath = URLDecoder.decode(url.getFile(), "UTF-8");
                    scanFileClassesInPackage(scanPackageClassName, filePath, recursive);
                } else if ("jar".equals(protocol)) {
                    // 如果是jar包文件
                    LOG.info("jar类型的扫描");
                    LogUtils.info("jar类型的扫描");
                    scanJarClassesInPackage(packageDirName, url);
                }
            }

            Selector.init(adaptorMap);
            LOG.info("注册Plugin成功。");
            LogUtils.info("注册Plugin成功。");
        } catch (Exception e) {
            LOG.error("注册Plugin异常"+e.getMessage());
            LogUtils.error("注册Plugin异常"+e.getMessage());
        }
    }

    private static void scanJarClassesInPackage(String packageDirName, URL url) throws ClassNotFoundException,
            InstantiationException, IllegalAccessException, IOException {
        JarFile jar = null;
        try {
            // 获取jar
            JarURLConnection jarconn = (JarURLConnection) url.openConnection();
            jar = jarconn.getJarFile();
            Enumeration<JarEntry> entries = jar.entries();
            while (entries.hasMoreElements()) {
                JarEntry entry = entries.nextElement();
                String name = entry.getName();
                // 如果是以/开头的
                if (name.charAt(0) == '/') {
                    name = name.substring(1);
                }
                if (name.startsWith(packageDirName) && name.endsWith(".class")&& name.indexOf("$")<0) {
                    Plugin plugin = null;
                    String className = name.replace('/', '.').substring(0, name.length() - 6);
                    Class<?> classz = Class.forName(className);
                    if (!Modifier.isInterface(classz.getModifiers())) {
                        Object obj = classz.newInstance();
                        if (obj instanceof Plugin){
                            plugin = (Plugin) obj;
                             LOG.info(obj.getClass().getName());
                        }
                    }
                    if (plugin != null) {
                        Adaptor adapter = new Adaptor(plugin);
                        adaptorMap.put(plugin.getPBType(), adapter);
                    }
                }
            }
        } catch (IOException e) {
            throw new IOException("jar类型的扫描异常", e);
        }

    }

    /**
     * 以文件的形式来获取包下的所有Class
     * 
     * @param packageName
     * @param packagePath
     * @param recursive
     * @param classes
     */
    public static void scanFileClassesInPackage(String packageName, String packagePath, final boolean recursive) {
        // 获取此包的目录 建立一个File
        File dir = new File(packagePath);
        // 如果不存在或者 也不是目录就直接返回
        if (!dir.exists() || !dir.isDirectory()) {
            // log.warn("用户定义包名 " + packageName + " 下没有任何文件");
            return;
        }
        // 如果存在 就获取包下的所有文件 包括目录
        File[] dirfiles = dir.listFiles(new FileFilter() {
            // 自定义过滤规则 如果可以循环(包含子目录) 或则是以.class结尾的文件(编译好的java类文件)
            public boolean accept(File file) {
                return (recursive && file.isDirectory()) || (file.getName().endsWith(".class"));
            }
        });
        // 循环所有文件
        for (File file : dirfiles) {
            // 如果是目录 则继续扫描
            if (file.isDirectory()) {
                // 如果存在 就获取包下的所有文件 包括目录
                File[] pbFiles = file.listFiles(new FileFilter() {
                    // 自定义过滤规则 如果可以循环(包含子目录) 或则是以.class结尾的文件(编译好的java类文件)
                    public boolean accept(File file) {
                        return (recursive && file.isDirectory()) || (file.getName().endsWith(".class"));
                    }
                });

                Plugin plugin = null;
                for (File pbFile : pbFiles) {
                    if (pbFile.getName().endsWith(".class") && pbFile.getName().indexOf("$")<0) {
                        String className = pbFile.getName().substring(0, pbFile.getName().length() - 6);
                        try {
                            Object obj = Class.forName(packageName + "." + file.getName() + '.' + className)
                                    .newInstance();
                            if (obj instanceof Plugin) {
                                plugin = (Plugin) obj;
                                LOG.info(obj.getClass().getName());
                                LogUtils.info(obj.getClass().getName());
                            }
                        } catch (Exception e) {
                            LOG.error("扫描Plugin异常"+e.getMessage());
                            LogUtils.error("扫描Plugin异常"+e.getMessage());
                        }
                    }
                }
                if (plugin != null) {
                    Adaptor adapter = new Adaptor(plugin);
                    adaptorMap.put(plugin.getPBType(), adapter);
                }
            }
        }
    }

    public static Adaptor getAdaptor(String pbType) {
        return adaptorMap.get(pbType);
    }
}


```
