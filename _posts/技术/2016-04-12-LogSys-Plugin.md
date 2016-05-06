---
layout: post
title: ��־ϵͳhandler֮��־��ϴ����Ȳ岥��ʵ��
category: ����
tags: Log 
keywords: 
description: 
---

### ����������һ��Plugin�ӿڣ�

```

public interface Plugin {
  //��ȡ��־����
  public String getPBType();
  //��ȡ��־������
  public Processor getProcessor();
  //��ȡ�����ESʵ��
  public Output getOutput();
}

```


### ����һ��Adaptor

���Դ�Adaptor�и�����־����ѡȡ��ͬ��Processor����־���д����Լ�Outputer����־������������

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
            LOG.warn("pb_type:" + getPbType() + "��["+ JSON.toJSONString(pojo)+"]Adaptor�����쳣, " + ESUtil.printStackTraceToString(e));
           
            DeplogVO vo = new DeplogVO();
            vo.setPbType(pojo.getPb_type());
            vo.setMessage("[" +JSON.toJSONString(pojo)+ "]Adaptor�����쳣, " + ESUtil.printStackTraceToString (e));
            LogUtils. warn(vo);
        }
        return result;
    }
}

```

### ����һ��Selector

����־����֮������ʹ��Selector������־���ʹ�adaptorMap��ѡȡ��ͬ��Adaptor��

```

public class Selector {

     // selector����֪ͨadaptor�ģ�Ȼ��adaptor������list������
     private static Map<String, Adaptor> adaptorMap;

     public static Adaptor select(CommonLogPojo pojo) {
           // 1.�ж�pojo
           if (null == pojo) {
               return null ;
          }
           // 2.��ȡAdaptor
           return selecotr .get(pojo.getPb_type());
     }

     public static void init(Map<String, Adaptor> map) {
           selecotr = map;
     }
}

```

### ����һ��PluginManager

����Ŀ������ʱ�����ǵ�������registerPlugin������ȥɨ��com.bd.log.pb���package�µ�java�࣬��������package��

������ļ����͵ģ���ȥɨ��class�ļ��������jar���͵ģ���ʹ��jar���͵�ɨ����ԡ�

Ȼ��԰��µ��ļ�������ƥ�䣬ͨ������õ�ʵ����

�ļ��ģ�

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
		   LOG.error("ɨ��Plugin�쳣" +e.getMessage());
		  LogUtils. error("ɨ��Plugin�쳣"+e.getMessage());
	     }
	}
   }
    if (plugin != null) {
    Adaptor adapter = new Adaptor(plugin);
    adaptorMap.put(plugin.getPBType(), adapter);
}

```

Jar�ļ��ģ�

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

Ȼ��ʵ��Plugin�ӿڵ�ʵ����װ��Adaptor�У�֮��Adaptor��ʵ���ŵ�һ��adaptorMap�У�����adaptorMap ע�뵽Selector�С�
```
Selector. init( adaptorMap);
```

PluginManager�ľ���������£�

```

public class PluginManager {
    private static Logger LOG = Logger.getLogger(PluginManager.class);

    public final static String scanPackageClassName = "com.bd.log.pb";
    private static Map<String, Adaptor> adaptorMap = new HashMap<String, Adaptor>();

    /**
     * ע��Plugin
     * 
     */
    public static void registerPlugin() {
        LOG.info("��ʼע��Plugin");
        LogUtils.info("��ʼע��Plugin");
        // �Ƿ�ѭ������
        boolean recursive = true;
        // ��ȡ�������� �������滻
        String packageDir = scanPackageClassName;
        String packageDirName = packageDir.replace('.', '/');
        // ����һ��ö�ٵļ��� ������ѭ�����������Ŀ¼�µ�things
        Enumeration<URL> dirs;
        try {
            dirs = Thread.currentThread().getContextClassLoader().getResources(packageDirName);
            // ѭ��������ȥ
            while (dirs.hasMoreElements()) {
                // ��ȡ��һ��Ԫ��
                URL url = dirs.nextElement();
                // �õ�Э�������
                String protocol = url.getProtocol();
                // ��������ļ�����ʽ�����ڷ�������
                if ("file".equals(protocol)) {
                    LOG.info("file���͵�ɨ��");
                    LogUtils.info("file���͵�ɨ��");
                    String filePath = URLDecoder.decode(url.getFile(), "UTF-8");
                    scanFileClassesInPackage(scanPackageClassName, filePath, recursive);
                } else if ("jar".equals(protocol)) {
                    // �����jar���ļ�
                    LOG.info("jar���͵�ɨ��");
                    LogUtils.info("jar���͵�ɨ��");
                    scanJarClassesInPackage(packageDirName, url);
                }
            }

            Selector.init(adaptorMap);
            LOG.info("ע��Plugin�ɹ���");
            LogUtils.info("ע��Plugin�ɹ���");
        } catch (Exception e) {
            LOG.error("ע��Plugin�쳣"+e.getMessage());
            LogUtils.error("ע��Plugin�쳣"+e.getMessage());
        }
    }

    private static void scanJarClassesInPackage(String packageDirName, URL url) throws ClassNotFoundException,
            InstantiationException, IllegalAccessException, IOException {
        JarFile jar = null;
        try {
            // ��ȡjar
            JarURLConnection jarconn = (JarURLConnection) url.openConnection();
            jar = jarconn.getJarFile();
            Enumeration<JarEntry> entries = jar.entries();
            while (entries.hasMoreElements()) {
                JarEntry entry = entries.nextElement();
                String name = entry.getName();
                // �������/��ͷ��
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
            throw new IOException("jar���͵�ɨ���쳣", e);
        }

    }

    /**
     * ���ļ�����ʽ����ȡ���µ�����Class
     * 
     * @param packageName
     * @param packagePath
     * @param recursive
     * @param classes
     */
    public static void scanFileClassesInPackage(String packageName, String packagePath, final boolean recursive) {
        // ��ȡ�˰���Ŀ¼ ����һ��File
        File dir = new File(packagePath);
        // ��������ڻ��� Ҳ����Ŀ¼��ֱ�ӷ���
        if (!dir.exists() || !dir.isDirectory()) {
            // log.warn("�û�������� " + packageName + " ��û���κ��ļ�");
            return;
        }
        // ������� �ͻ�ȡ���µ������ļ� ����Ŀ¼
        File[] dirfiles = dir.listFiles(new FileFilter() {
            // �Զ�����˹��� �������ѭ��(������Ŀ¼) ��������.class��β���ļ�(����õ�java���ļ�)
            public boolean accept(File file) {
                return (recursive && file.isDirectory()) || (file.getName().endsWith(".class"));
            }
        });
        // ѭ�������ļ�
        for (File file : dirfiles) {
            // �����Ŀ¼ �����ɨ��
            if (file.isDirectory()) {
                // ������� �ͻ�ȡ���µ������ļ� ����Ŀ¼
                File[] pbFiles = file.listFiles(new FileFilter() {
                    // �Զ�����˹��� �������ѭ��(������Ŀ¼) ��������.class��β���ļ�(����õ�java���ļ�)
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
                            LOG.error("ɨ��Plugin�쳣"+e.getMessage());
                            LogUtils.error("ɨ��Plugin�쳣"+e.getMessage());
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
