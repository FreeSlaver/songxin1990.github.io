---
layout: page

title: Flask笔记
category: python
tags:  [faq]
keywords:
description:
---

  不行，这样还是学习的太慢了。
  不断看文档，这样太慢，应该直接操。
  拿到项目，例子直接看代码，然后不清楚的地方再google，查文档。

  使用代理的话，无法访问，握草。
## flask和bootstrap结合
   https://stackoverflow.com/questions/41412159/bootstrap-with-flask
```html
   -project
    app.py
    - templates
        index.html
    -static
        -css
          style.css
        -js
          example.js
        -img
          example.jpg
```
   并且使用url_for这个函数。
```html
   <html>
       <head>
           <link rel="stylesheet" href="{{ url_for('static', filename='css/style.css') }}">
       </head>
       <body>
       </body>
   </html>
```
### 清除缓存，强制刷新浏览器
    Command+Shift+R
## flask和ajax post json的问题
   妈的，搞的JB烦死人了。

   首先提交一个form，建议直接用form的形式，不要ajax。

   如果用了ajax，需要这样：
```javascript
   var data = {
      data: JSON.stringify({
                        "value":'asdf'
                    })
      }
   };

   $.ajax({
     url:"/",
     type: 'POST',
     data: data,
     success: function(msg){
       alert(msg);
       }
     })
```

```python
   from flask import json
   @app.route("/", methods=['POST'])
   def get_data():
   data = json.loads(request.form.get('data'))
   ss = data['value']
   return str(ss)
```   
   恶心的要命。


   其次还要问题就是
   用了request.data之后，request.form里面的东西也会没有。

   如果直接提交form的话，data是null。
## flask 引入html页面
include

   有没有一些通用的框架？每次都要学些新东西。

   那么这个include和集成机制有什么区别？
   也就是子template要覆盖的部分就用block之类的，然后在子template中覆盖。
## flask模板继承
使用extends这个，但是和liquid冲突，没法用上面的这种inlucde来写，
   现在要做的是：这个body怎么弄？还是include？
## Broken pip
   需要结合WSGI使用，并且加上app.run(threaded=True)

   https://stackoverflow.com/questions/12591760/flask-broken-pipe-with-requests
   参考这个链接
## 字符串
### contains
```python
if x in y
 multiple contains
if any(x in str for x in a):
```