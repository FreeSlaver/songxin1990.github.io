---
layout: page
breadcrumb: true
title: 模拟HTTP请求
category: trash
categoryStr: 废弃
tags: HTTP
keywords: 
description: 
---

之前在做短信消息平台的时候，需要模拟各种规范的HTTP请求，GET或者POST之类的，使用到的工具类如下：

这种发送HTTP只能是那种JSON格式报文的POST请求：

```

public class HttpUtils {
    public static HttpResponse POST(String url,String postBody) throws ClientProtocolException, IOException{
//        HttpClient httpClient = HttpClients.createDefault();
        CloseableHttpClient  httpClient = HttpClients.createDefault();
        RequestConfig requestConfig = RequestConfig.custom().setSocketTimeout(5000)
                .setConnectTimeout(5000).build(); //设置请求和传输超时时间
       
        HttpPost post = new HttpPost (url);
       
        //设置超时
        post.setConfig(requestConfig);
       
        StringEntity input = new StringEntity(postBody,"utf-8");
        input.setContentType("application/json;charset=utf-8" );
        post.setEntity(input);
       
        HttpResponse response = httpClient.execute(post);
        return response;
    }
    public static HttpResponse GET(String url,Map<String,String> params){
      
        return null ;
    }
   
    public static void main(String[] args) throws ClientProtocolException, IOException {
        String url = "http://localhost:9093/msg/sms" ;
       
        String msg = "测试中文！！！" ;
        POST(url,msg);
       
    }
   
}

```


这种是模拟了GET和POST请求，类似浏览器行为的：

```

public class HttpTookit {

     public static String get(String url, Map<String, String> parameters) {
          String result = "";// 返回的结果
          BufferedReader in = null;// 读取响应输入流
          StringBuffer sb = new StringBuffer();// 存储参数
          String params = "";// 编码之后的参数
           try {
               // 编码请求参数
               if (parameters.size() == 1) {
                    for (String name : parameters.keySet()) {
                        sb.append(name)
                                  .append( "=")
                                  .append(java.net.URLEncoder. encode(
                                           parameters.get(name), "UTF-8"));
                   }
                   params = sb.toString();
              } else {
                    for (String name : parameters.keySet()) {
                        sb.append(name)
                                  .append( "=")
                                  .append(java.net.URLEncoder. encode(
                                           parameters.get(name), "UTF-8")).append("&" );
                   }
                   String temp_params = sb.toString();
                   params = temp_params.substring(0, temp_params.length() - 1);
              }
              String full_url = url + "?" + params;
               // System.out.println(full_url);
              LogUtil. debug(HttpTookit.class, "完整的请求URL是" + full_url);
               // 创建URL对象
              java.net.URL connURL = new java.net.URL(full_url);
               // 打开URL连接
              java.net.HttpURLConnection httpConn = (java.net.HttpURLConnection) connURL
                        .openConnection();
               // 设置超时
              httpConn.setConnectTimeout(5000);

               // 设置通用属性
              httpConn.setRequestProperty( "Accept", "*/*");
              httpConn.setRequestProperty( "Connection", "Keep-Alive");
              httpConn.setRequestProperty( "User-Agent",
                         "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)");
               // 建立实际的连接
              httpConn.connect();
               // 响应头部获取
              Map<String, List<String>> headers = httpConn.getHeaderFields();
               // 遍历所有的响应头字段
               for (String key : headers.keySet()) {
                    // System.out.println(key + "\t：\t" + headers.get(key));

              }
               // 定义BufferedReader输入流来读取URL的响应,并设置编码方式
              in = new BufferedReader(new InputStreamReader(
                        httpConn.getInputStream(), "UTF-8"));
              String line;
               // 读取返回的内容
               while ((line = in.readLine()) != null) {
                   result += line;
              }
          } catch (Exception e) {
               // e.printStackTrace();
              LogUtil. error(HttpTookit.class, e.getMessage());
          } finally {
               try {
                    if (in != null ) {
                        in.close();
                   }
              } catch (IOException e) {
                    // ex.printStackTrace();
                   LogUtil. error(HttpTookit.class, e.getMessage());
              }
          }
           return result;
     }

     public static String post(String url, Map<String, String> parameters) {
          String result = "";// 返回的结果
          BufferedReader in = null;// 读取响应输入流
          PrintWriter out = null;
          StringBuffer sb = new StringBuffer();// 处理请求参数
          String params = "";// 编码之后的参数
           try {
               // 编码请求参数
               if (parameters.size() == 1) {
                    for (String name : parameters.keySet()) {
                        sb.append(name)
                                  .append( "=")
                                  .append(java.net.URLEncoder. encode(
                                           parameters.get(name), "UTF-8"));
                   }
                   params = sb.toString();
              } else {
                    for (String name : parameters.keySet()) {
                        sb.append(name)
                                  .append( "=")
                                  .append(java.net.URLEncoder. encode(
                                           parameters.get(name), "UTF-8")).append("&" );
                         // sb.append(name).append("=").append(
                         // parameters.get(name));
                         //
                   }
                   String temp_params = sb.toString();
                   params = temp_params.substring(0, temp_params.length() - 1);
              }
               // 创建URL对象
              java.net.URL connURL = new java.net.URL(url);
               // 打开URL连接
              java.net.HttpURLConnection httpConn = (java.net.HttpURLConnection) connURL
                        .openConnection();

               // 设置超时
              httpConn.setConnectTimeout(5000);
               // 设置通用属性
              httpConn.setRequestProperty( "Accept", "*/*");
              httpConn.setRequestProperty( "Connection", "Keep-Alive");
              httpConn.setRequestProperty( "User-Agent",
                         "Mozilla/4.0 (compatible; MSIE 8.0; Windows NT 6.1)");
               // 设置POST方式
              httpConn.setDoInput( true);
              httpConn.setDoOutput( true);
               // 获取HttpURLConnection对象对应的输出流
              out = new PrintWriter(httpConn.getOutputStream());
               // 发送请求参数
              out.write(params);
               // flush输出流的缓冲
              out.flush();
               // 定义BufferedReader输入流来读取URL的响应，设置编码方式
              in = new BufferedReader(new InputStreamReader(
                        httpConn.getInputStream(), "UTF-8"));
              String line;
               // 读取返回的内容
               while ((line = in.readLine()) != null) {
                   result += line;
              }
          } catch (Exception e) {
              e.printStackTrace();
          } finally {
               try {
                    if (out != null ) {
                        out.close();
                   }
                    if (in != null ) {
                        in.close();
                   }
              } catch (IOException ex) {
                   ex.printStackTrace();
              }
          }
           return result;
     }

     public static void main(String[] args) {
          String url = "http://localhost:9093/msg/sms" ;
          String uid = "80000";
          String code = "585";
          String pass = "1234abcd";
          String expid = "0";
          String mobile = "18025360608";
          String msg = "测试中文！！！" ;

          String auth = MD5Util. MD5(code, pass).toLowerCase();

          Map<String, String> postBody = new HashMap<String, String>();
          postBody.put( "uid", uid);
          postBody.put( "auth", auth);
          postBody.put( "mobile", mobile);
          postBody.put( "msg", msg);
          postBody.put( "expid", expid);

           // String x = doPost(url,postBody);
           // String x = sendGet(url, postBody);
          String x = post(url, postBody);
          System. out.println(x);
     }
}

```