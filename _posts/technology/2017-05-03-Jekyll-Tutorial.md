---
layout: post
title: Jekyll Tutorial 官方教程中文版
category: tips
tags: tips
keywords: jekyll,github pages,blog
description: 这篇文章是我翻译的Jekyll Tutorial 官方教程中文版
---


{% raw %}
<div id="table-of-contents">
<h2>目录</h2>
<div id="text-table-of-contents">
<ul>
<li><a href="#sec-1">1. Jekyll Tutorial 官方教程中文版</a>
<ul>
<li><a href="#sec-1-1">1.1. Install</a>
<ul>
<li><a href="#sec-1-1-1">1.1.1. Windows</a></li>
<li><a href="#sec-1-1-2">1.1.2. Linux</a></li>
</ul>
</li>
<li><a href="#sec-1-2">1.2. Command</a></li>
<li><a href="#sec-1-3">1.3. 使用jekyll创建博客</a>
<ul>
<li><a href="#sec-1-3-1">1.3.1. Posts博文</a></li>
<li><a href="#sec-1-3-2">1.3.2. Pages 页面</a></li>
<li><a href="#sec-1-3-3">1.3.3. Static Files 静态文件</a></li>
<li><a href="#sec-1-3-4">1.3.4. Variables 变量</a></li>
<li><a href="#sec-1-3-5">1.3.5. Templates 模板</a></li>
<li><a href="#sec-1-3-6">1.3.6. Plugins</a></li>
<li><a href="#sec-1-3-7">1.3.7. Themes</a></li>
<li><a href="#sec-1-3-8">1.3.8. Liquid</a></li>
</ul>
</li>
</ul>
</li>
</ul>
</div>
</div>

# Jekyll Tutorial 官方教程中文版<a id="sec-1" name="sec-1"></a>

## Install<a id="sec-1-1" name="sec-1-1"></a>

### Windows<a id="sec-1-1-1" name="sec-1-1-1"></a>

1.Install chocolatey
   @powershell -NoProfile -ExecutionPolicy Bypass -Command "iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))" && SET "PATH=%PATH%;%ALLUSERSPROFILE%\chocolatey\bin"
1.  Install ruby
    choco install ruby -y
2.  Install bundler
    gem install bundler
    1.  Install jekyll
        gem install jekyll

### Linux<a id="sec-1-1-2" name="sec-1-1-2"></a>

## Command<a id="sec-1-2" name="sec-1-2"></a>

jekyll build : 编译生成网站到site目录下，可以使用
  &#x2013;destination <destination>指定目录，
  &#x2013;source <source> &#x2013;destination <destination>指定源目录
  &#x2013;watch 热更新，但是.config.yml中的不会有效果
jekyll server : 启动服务器4000端口
  &#x2013;detach 好像是后台运行，使用kill -9 1234杀掉
  &#x2013;no-watch 无视热更新

## 使用jekyll创建博客<a id="sec-1-3" name="sec-1-3"></a>

gem install jekyll bundler
jekyll new myblog
cd myblog
bundle exec jekyll server

使用Pygments或者Rouge来显示高亮语法。

1.  目录结构

         jekyll支持的语法有Markdown,Textile,HTML。然后通过jekyll将内容和layout布局文件
         一起搅拌。可以自定义URL，哪些data进行展示。
```        
    ├── \_config.yml
    ├── \_data
    

    
    
    <colgroup>
    <col  class="left" />
    </colgroup>
    <tbody>
    <tr>
    <td class="left">└── members.yml</td>
    </tr>
    </tbody>
    </table>
    
    ├── \_drafts
    
    <table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">
    
    
    <colgroup>
    <col  class="left" />
    </colgroup>
    <tbody>
    <tr>
    <td class="left">├── begin-with-the-crazy-ideas.md</td>
    </tr>
    
    
    <tr>
    <td class="left">└── on-simplicity-in-technology.md</td>
    </tr>
    </tbody>
    </table>
    
    ├── \_includes
    
    <table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">
    
    
    <colgroup>
    <col  class="left" />
    </colgroup>
    <tbody>
    <tr>
    <td class="left">├── footer.html</td>
    </tr>
    
    
    <tr>
    <td class="left">└── header.html</td>
    </tr>
    </tbody>
    </table>
    
    ├── \_layouts
    
    <table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">
    
    
    <colgroup>
    <col  class="left" />
    </colgroup>
    <tbody>
    <tr>
    <td class="left">├── default.html</td>
    </tr>
    
    
    <tr>
    <td class="left">└── post.html</td>
    </tr>
    </tbody>
    </table>
    
    ├── \_posts
    
    <table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">
    
    
    <colgroup>
    <col  class="left" />
    </colgroup>
    <tbody>
    <tr>
    <td class="left">├── 2007-10-29-why-every-programmer-should-play-nethack.md</td>
    </tr>
    
    
    <tr>
    <td class="left">└── 2009-04-26-barcamp-boston-4-roundup.md</td>
    </tr>
    </tbody>
    </table>
    
    ├── \_sass
    
    <table border="2" cellspacing="0" cellpadding="6" rules="groups" frame="hsides">
    
    
    <colgroup>
    <col  class="left" />
    </colgroup>
    <tbody>
    <tr>
    <td class="left">├── \_base.scss</td>
    </tr>
    
    
    <tr>
    <td class="left">└── \_layout.scss</td>
    </tr>
    </tbody>
    </table>
    
    ├── \_site
    ├── .jekyll-metadata
    └── index.html # can also be an 'index.md' with valid YAML Frontmatter
        很重要的一节内容：<https://jekyllrb.com/docs/structure/>
        \_config.yml 存储配置内容
        \_includes 存储局部模板，可以被layouts和posts搅拌使用。里面可以使用liquid标签。
                       使用方式：<sub>includes</sub>/files.ext然后引入使用{% include file.ext %}
        \_layouts 模板文件用来包裹posts的。使用{{ content }}来注入文章内容。
        \_posts 存储文章内容，文件命名规范很重要，必须以YEAR-MONTH-DAY-title.MARKUP。
                   文件名是唯一标示。
        \_data 存储格式化好了的站点数据。jekyll引擎会装载站点数据，以 .yml .yaml .json .cvs
                  结尾的文件。使用site.data来访问，如果有member.yml文件，可以使用site.data.memebers
                  来访问数据。
        \_sass 存储sass局部模板，可以被导入到main.scss中，最终会被处理为main.css。
        \_site 存储最终形成的网站静态的html页面。最好添加到.gitignore文件中。
        .jekyll-metadata 用来追踪哪些文件需要重新生成的，
        \_index.html或index.md 保证这个文件又一个YMAL Front Matter区域，
        其他文件，比如css，images，favicon.ico等。
```   
    1.  配置
    
        配置被定义在<sub>config</sub>.yml文件中。具体查看<https://jekyllrb.com/docs/configuration/>
        encoding: UTF-8，默认就是utf-8。
        注意不要在<sub>config</sub>.yml配置文件使用Tab，不然会解析错误，使用默认配置。使用空格。
        
        自定义header，在<sub>config</sub>.yml中添加
        webrick：
            headers:
                My-Header: My-Value
                My-Other-Header: Other-Value
        
        使用defaults关键字在配置文件中设置默认配置。
        defaults:
        -   scope:
            path: "" # an empty string here means all files in the project. Required
            type: "posts" # previously \`post\` in Jekyll 2.2.only applay posts not css etc.Optional
            values:
            layout: "default"
        
        如何使用了？在md文件中
        &#x2014;
        author: "John Smith"
        layout: "foobar"
        &#x2014;
        常用的类型有：pages,posts,drafts.
        Markdown还有plugin？
    
    2.  插件
    
        Redcarpet，常用的有tables，<sub>intra</sub><sub>emphasis，autolink。</sub>
    
    3.  扉页
    
        &#x2014;
        layout: post
        title: Blogging Like a Hacker
        published: false #这样文章就不会被发布了
        &#x2014;
        任何文件含有以上YML代码块的文件都会被jekyll认为是特殊文件并进行处理。
        必须放在文件的开头。
        任何在里面定义的键值对，可以被liquid标签使用，在layouts或者page，或者post文件中。
        注意一点是使用utf-8编码的时候，不要有BOM头字符。
        可以指定published为false，不发表文章，可以使用date属性精确到时分秒，
        YYYY-MM-DD HH:MM:SS +/-TTTT。
        可以使用post<sub>url标签链接到其他的文章</sub>
        可以创建一个assets或者downloads文件夹放图片，下载的文件等。

### Posts博文<a id="sec-1-3-1" name="sec-1-3-1"></a>

遍历
<ul>
{% for post in site.posts %}
    <li>
        <a href="{{ post.url }}">{{ post.title }}</a>
        {{ post.excerpt }} #显示摘要，默认是第一段
    </li>
{% endfor %}
</ul>

Post excerpts 博文摘要，简介
{{ post.excerpt | remove: '<p>' | remove: '</p>' }}
因为jekyll已经帮忙添加了p标签。
可以在YAML中添加excerpt属性，自定义摘录。还可以用excerpt<sub>separator</sub>?
不仅这里要定义，那个layout文件中也要遍历显示出来才行。
也可以传递 | strip<sub>html</sub> 去掉html标签，这非常有用，对于想让description中的内容作为
摘录，也就是meta="description"标签的。

1.  高亮代码块

    {% highlight ruby linenos %}
    def show
        @widget = Widget(params[:id])
        respond<sub>to</sub> do |format|
            format.html # show.html.erb
            format.json { render json: @widget }
        end
    end
    {% endhighlight %}
    可以使用linenos

### Pages 页面<a id="sec-1-3-2" name="sec-1-3-2"></a>

可以在YAML中使用permalink自定义URL。也可以去掉html后缀。

### Static Files 静态文件<a id="sec-1-3-3" name="sec-1-3-3"></a>

不包含YAML，所以不会被渲染。使用site.static<sub>files访问。</sub>
有以下属性file.path，
defaults:
-   scope:
      path: "assets/img"
    values:
      image: true
    尽管你不能直接添加类似YAML的扉页，但是你可以在<sub>config</sub>.yml中设置全局属性。
    上面定义了assets/img目录下面的所有文件都是image。这样扉页属性就会是image： true。
    
    {% assign image<sub>files</sub> = site.static<sub>files</sub> | where: "image", true %}
    {% for myimage in image<sub>files</sub> %}
        {{ myimage.path }}
    {% endfor %}
    遍历所有的静态文件，只有当image属性是true的文件。输出每个image文件的路径。

### Variables 变量<a id="sec-1-3-4" name="sec-1-3-4"></a>

非常重要的一章内容：<https://jekyllrb.com/docs/variables/>

1.  Global 全局变量

    1.  Site 变量
    
        配置在<sub>config</sub>.yml中的属性。
        site.pages 所有页面
        site.posts 时间倒序的所有文章
        site.related<sub>posts</sub> 如果被处理的页面是Post的话，会有10篇相关文章，也就是时间上
        近期的文章。可以使用&#x2013;lsi参数命令。但是Github不支持。
        site.static<sub>files</sub> 全站的静态文件。文件又3个属性path，modified<sub>time，extname。</sub>
        site.data 定义在YAML文件中，从<sub>date目录下装载的数据文件。</sub>
        site.categories.CATEGORY：The list of all Posts in category CATEGORY
        site.tags.TAG 所有的Post中定义了的标签TAG。
        site.[CONFIGURATION<sub>DATA]：任何定义在</sub><sub>config</sub>.yml中的属性都能被这样访问。
    
    2.  Page 变量
    
        page特定信息+配置在YML扉页中的属性
        page.content
        page.title
        page.excerpt 没有被渲染的摘要？
        page.urlo
        page.data
        page.id：唯一的ID，用于RSS。
        page.categories：The list of categories to which this post belongs. Categories are derived from the directory structure above the \_posts directory.
        For example, a post at /work/code/<sub>posts</sub>/2008-12-24-closures.md would have this field set to ['work', 'code']. These can also be specified in the YAML Front Matter.
        page.tags
        page.path
        page.next：下一篇和当前Post position相关的文章。
        page.previous：上一篇文章，都是site.posts遍历的结果。
    
    3.  Paginator 翻页变量
    
         paginator.per<sub>page：每Page的Post数量</sub>
         paginator.posts：当前Page有效的Posts
         paginator.total<sub>posts：总博文数量</sub>
         paginator.total<sub>pages：总页面数量</sub>
         paginator.page：当页面Page的页面数量
         paginator.previous<sub>page</sub>
         paginator.previous<sub>page</sub><sub>path：前一个页面Page的路径。</sub>
         paginator.next<sub>page</sub>
         paginator.next<sub>page</sub><sub>path</sub>
         Paginator属性只在index文件中有效果。
        layout layout特定信息+配置在YML扉页中的
        content 内容
        pginator 分页

### Templates 模板<a id="sec-1-3-5" name="sec-1-3-5"></a>

这章也很重要，<https://jekyllrb.com/docs/templates/>

1.  Filters

    {{ "/assets/style.css" | relative<sub>url</sub> }}的输出结果是/my-baseurl/assets/style.css
    {{ site.time | date<sub>to</sub><sub>string</sub> }} 输出结果07 Nov 2008。
    所以我在post.html中看到的{{ page.date | date: "%Y年%m月%d日" }}就会输出2017年08月08日。
    
    Where
    从数组中选取匹配key和value的对象。{{ site.members | where:"graduation<sub>year</sub>","2014" }}
    
    Where Expression
    支持表达式。{{ site.members | where<sub>exp</sub>:"item","item.graduation<sub>year</sub> < 2014" }}
    还有contains关键字。
    
    Group By
    
    Number of Words
    {{ page.content | number<sub>of</sub><sub>words</sub> }}
    
    Array to Sentence
    将数组转换为字符串。对于列出标签很有用。
    {{ page.tags | array<sub>to</sub><sub>sentence</sub><sub>string</sub>: 'or' }} 输出结果 foo，bar，or baz
    
    Data To JSON
    将hash或者数组转换为JSON。
    {{ site.data.projects | jsonify }}
    
    Sample
    随机取一个或多个数。
    {{ site.pages | sample:2 }}
    
    Array Filters
    支持数组操作，但是不会改变原数组。
    {{ page.tags | push: 'Spokane' }}
    
    Inspect
    将对象转换为字符串，用于debug。

2.  Tags 标签

    如果你有一段内容想要在任何界面展示，使用include标签，并放在<sub>includes文件夹下。</sub>
    {% include footer.html%}

3.  Gist

    神奇啊，牛逼啊，可以直接使用gits标签来嵌入GitHub Gist中的文件到站点。
    {% gist parkr/931c1c8d465a04042403 jekyll-private-gist.markdown %}
    add  environmental variable JEKYLL<sub>GITHUB</sub><sub>TOKEN</sub> to \_config.yam,Jekyll Gist will use the Gist API to speed up site generation.
    配置gist: noscript: false

4.  Links

    {{ site.baseurl }}{% link \_posts/2016-07-26-name-of-post.md %}
    这个路径是根据root目录决定的也就是你的<sub>config</sub>.yml文件存档的地方。
    不支持filters，并且如果link标签里面的路径错误的话，也不会构建站点。
    感觉是个鸡肋，不如直接使用html。不对，这个东西应该是更加方便。
    
    链接到Posts
    {{ site.baseurl }}{% post<sub>url</sub> 2010-07-21-name-of-post %}

5.  Includes

    {% include footer.html %} 这会将<sub>include目录下的footer</sub>.html文件嵌入当前位置。
    也可以使用相对路径指定要嵌入的html页面。
    
    还可以在YAML中定义变量，然后嵌入
    {% include {{ page.my<sub>variable</sub> }} %}
    
    还可以使用变量，在include的时候指定值。
    <div markdown="span" class="alert alert-info" role="alert">
    <i class="fa fa-info-circle"></i> <b>Note:</b>
    {{ include.content }}
    </div>
    {% include note.html content="This is my sample note." %}

### Plugins<a id="sec-1-3-6" name="sec-1-3-6"></a>

1.  Search Plugin

    因为github pages不支持自定义plugin，所以没什么意义。

### Themes<a id="sec-1-3-7" name="sec-1-3-7"></a>

<https://rubygems.org/search?utf8=%E2%9C%93&query=jekyll-theme> 可以搜素主题。
在Gemfile文件中添加：gem "jekyll-theme-awesome"
命令行运行：bundle install
在<sub>config</sub>.yml中激活主题：theme: jekyll-theme-awesome
命令行中运行：bundle exec jekyll serve

### Liquid<a id="sec-1-3-8" name="sec-1-3-8"></a>

请参看我的另外一篇文章[]

{% end raw %}