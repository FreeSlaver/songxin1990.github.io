/**
 * Created by 001844 on 2018/5/2.
 */
/*function postComment() {
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
 }*/

/*function listComment() {
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
 }*/
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


/*in $.documentReady*/
/*    var commentPostClicked = 0;
 $("#comment_ico").click(function () {
 if (commentPostClicked == 0) {
 $("#comment_post form").show();
 commentPostClicked = 1;
 } else {
 $("#comment_post form").hide();
 commentPostClicked = 0;
 }
 })
 listComment();*/