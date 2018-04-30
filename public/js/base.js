/* 控制导航按钮动作 */
function nav_click(is_show) {
    if (is_show) {
        $(".aside1").hide();
    } else {
        $(".aside1").show();
    }
}

function nav_click_old(is_show) {
    if (is_show) {
        /* 显示左侧aside */
        $('.aside')
            .addClass('visible-md visible-lg')
            .removeClass('hidden-md hidden-lg')
        /* 调整右侧内容 */
        $('.aside3')
            .removeClass('col-md-13 col-lg-13')
            .addClass('col-md-13 col-lg-13');
        /* 调整文字内容格式 */
        $('.aside3-content')
            .removeClass('col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2')
            .addClass('col-md-13');
    } else {
        /* 隐藏左侧aside */
        $('.aside')
            .removeClass('visible-md visible-lg')
            .addClass('hidden-md hidden-lg');
        /* 右侧内容最大化 */
        $('.aside3')
            .removeClass('col-md-13 col-lg-13')
            .addClass('col-md-13 col-lg-13');
        /* 修改文字排版 */
        $('.aside3-content')
            .removeClass('col-md-13')
            .addClass('col-md-10 col-lg-8 col-md-offset-1 col-lg-offset-2');
    }
}
/* 控制文章章节列表按钮 */
function content_click(is_show) {
    if (is_show) {
        $('#content_table').show();
        $('#content_btn i').removeClass('fa-plus').addClass('fa-minus');
    } else {
        $('#content_table').hide();
        $('#content_btn i').removeClass('fa-minus').addClass('fa-plus');
    }
}

$(document).ready(function () {
    /* 控制左侧 aside 的动作 */
    $("#nav_btn").on('click', function () {
        isClicked = $(this).data('clicked');

        nav_click(isClicked);

        $(this).data('clicked', !isClicked);
    });

    /*$("#content_btn").on('click', function(){
     isClicked = $(this).data('clicked');

     content_click(!isClicked);

     $(this).data('clicked',!isClicked);

     });*/

    $(document).pjax('.pjaxlink', '#pjax', {fragment: "#pjax", timeout: 10000});
    $(document).on("pjax:end", function () {
        if ($("body").find('.container').width() < 992)
            $('#nav_btn').click();
        $('.aside3').scrollTop(0);
        contentEffects();
    });
    /*$('body').on('click', '.show-commend', function(){
     var ds_loaded = false;
     window.disqus_shortname = $('.show-commend').attr('name');
     $.ajax({
     type: "GET",
     url: "http://" + disqus_shortname + ".disqus.com/embed.js",
     dataType: "script",
     cache: true
     });
     });*/
    contentEffects();

    // loadViewTimes();

    var commentPostClicked = 0;
    $("#comment_ico").click(function () {
        if (commentPostClicked == 0) {
            $("#comment_post form").show();
            commentPostClicked = 1;
        } else {
            $("#comment_post form").hide();
            commentPostClicked = 0;
        }
    })
    listComment();

});
function contentEffects() {
    //remove the asidebar
    $('.row-offcanvas').removeClass('active');
    if ($("#nav").length > 0) {
        $("#content > h2,#content > h3,#content > h4,#content > h5,#content > h6").each(function (i) {
            var current = $(this);
            current.attr("id", "title" + i);
            tag = current.prop('tagName').substr(-1);
            $("#nav").append("<div style='margin-left:" + 15 * (tag - 1) + "px'><a id='link" + i + "' href='#title" + i + "'>" + current.html() + "</a></div>");
        });
        $("pre").addClass("prettyprint");
        prettyPrint();
        $('#content img').addClass('img-thumbnail').parent('p').addClass('center');
        $('#content_btn').show();
    } else {
        $('#content_btn').hide();
    }
}
/*
 function loadViewTimes() {
 var title =
 $.ajax({
 type: "GET",
 url: "http://" + disqus_shortname + ".disqus.com/embed.js",
 dataType: "script",
 cache: true
 });

 }*/
function listComment() {
    var pageTitle =getPageTitle();
    $.ajax({
        type: "GET",
        url: "http://data.3gods.com/comment/list?blogTitle="+pageTitle,
        success: function (data) {
            var json = $.parseJSON(data);
            var code = json.code;
            var msg = json.msg;
            console.info("code" + code + ",msg:" + msg);
            var dataObj = json.data;

            var size = dataObj.length;
            if (size <= 0) {
                console.info("non comment");
                return;
            } else {
                var commentListStr = "<h3>评论" + size + "条</h3>";
                var commentStr = "<div class='comment'><h5 class='comment_name'>{commentName}说：</h5><p class='comment_content'>{commentContent}</p>" +
                    "<div class='comment_footer'> <span class='comment_time'>{commentTime}</span><a href='#'><span>回复</span></a></div></div>";

                for (var i = 0; i < size; i++) {
                    var comment = dataObj[i];
                    var commentName = comment.name;
                    var commentContent = comment.content;
                    var commentTime = comment.createTime;

                    commentStr = commentStr.replace("{commentName}", commentName);
                    commentStr = commentStr.replace("{commentContent}", commentContent);
                    commentStr = commentStr.replace("{commentTime}", formatDate(commentTime));

                    commentListStr = commentListStr + commentStr;
                }
                $("#comment_list").append(commentListStr);
            }

        },
        error: function (data) {
            console.info(data);
        }
    });
}
function formatDate(date) {
    var d;
    if (date == null) {
        d = new Date();
    }
    d = new Date(date);
    var ymd = d.toLocaleDateString();
    var hom = d.toTimeString();
    var result = ymd.replace(/\//g, "-") + " " + hom.substring(0, 9);
    return result;
}
function getPageTitle() {
    var pageUrl = window.location.href;
    var startIndex = pageUrl.lastIndexOf("/") + 1;
    var endIndex = pageUrl.lastIndexOf(".");
    var pageTitle = pageUrl.substring(startIndex, endIndex);
    return pageTitle;
}
function postComment() {
    var comment = $("#comment_post form")[0].serialize();
    comment.push("blog_title",getPageTitle());
    $.ajax({
        type: "post",
        url: "http://data.3gods.com/comment/add",
        dataType: 'json',
        data: comment,
        success: function (data) {
            console.info(data)
        },
        error:function (data) {
            console.info(data);
        }
    });
}
