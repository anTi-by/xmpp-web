var server = $.cookie('server');
var room_name = $.cookie('room_name') || '54f95f124c165e9824000dab';
var BOSH_SERVICE = 'http://' + server +':5280';
var ROOM_JID = room_name + '@muc.' + server;
var ADMIN_JID = 'admin@' + server;
var connection = null;
var connected = false;
var jid = "";
var i = 0;
var resource = 'web';

function add_message(name,img,msg,clear) {
	i = i + 1;
	var  inner = $('#chat-messages-inner');
	var time = new Date();
	var hours = time.getHours();
	var minutes = time.getMinutes();
	if(hours < 10) hours = '0' + hours;
	if(minutes < 10) minutes = '0' + minutes;
	var id = 'msg-'+i;
    var idname = name.replace(' ','-').toLowerCase();
	inner.append('<p id="'+id+'" class="user-'+idname+'">'
									+'<span class="msg-block"><img src="'+img+'" alt="" /><strong>'+name+'</strong> <span class="time">- '+hours+':'+minutes+'</span>'
									+'<span class="msg">'+msg+'</span></span></p>');
	$('#'+id).hide().fadeIn(800);
	if(clear) {
		$('.chat-message input').val('').focus();
	}
	$('#chat-messages').animate({ scrollTop: inner.height() },100);
}

// 连接状态改变的事件
function onConnect(status) {
    if (status == Strophe.Status.CONNFAIL) {
        alert("连接失败！");
    } else if (status == Strophe.Status.AUTHFAIL) {
        alert("登录失败！");
    } else if (status == Strophe.Status.DISCONNECTED) {
        alert("连接断开！");
        connected = false;
        logout();
    } else if (status == Strophe.Status.CONNECTED) {
        connected = true;

        // 当接收到<message>节，调用onMessage回调函数
        connection.addHandler(onMessage, null, 'message', null, null, null);

        // 首先要发送一个<presence>给服务器（initial presence
        connection.send($pres().tree());

        // 发送<presence>元素，加入房间
        connection.send($pres({
            from: jid,
            to: ROOM_JID + "/" + jid.substring(0,jid.indexOf("@"))
        }).c('x',{xmlns: 'http://jabber.org/protocol/muc'}).tree());
    }
}  
  
// 接收到<message>  
function onMessage(msg) {
    // 解析出<message>的from、type属性，以及body子元素
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('params');
    var msgID = msg.getAttribute('id')

    if (type == "groupchat" && elems.length > 0) {
    	var body = elems[0].firstChild;
        add_message(from.substring(from.indexOf('/') + 1), 'img/demo/av1.jpg', Strophe.getText(body), true);
        buildACKMessageWithMID(msgID);
    }

    return true;
}

var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z'];

function generateMixed(n) {
     var res = "";
     for(var i = 0; i < n ; i ++) {
         var id = Math.ceil(Math.random()*35);
         res += chars[id];
     }
     return res;
}

function logout() {
    // 清空cookie
    $.removeCookie('username');
    $.removeCookie('password');
    $.removeCookie('server');
    window.location.href = './login.html';
}

function remove_user(userid,name) {
    i = i + 1;
    $('.contact-list li#user-'+userid).addClass('offline').delay(1000).slideUp(800,function(){
        $(this).remove();
    });
    var  inner = $('#chat-messages-inner');
    var id = 'msg-'+i;
    inner.append('<p class="offline" id="'+id+'"><span>User '+name+' left the chat</span></p>');
    $('#'+id).hide().fadeIn(800);
}

// 发送消息  
function send(val) {
    if(connected) {

        // 创建一个<message>元素并发送
        // <params messagetype="0" xmlns="yl:xmpp:params"><text>aaaa</text></params> 
        var attr = [['messagetype', '0'], ['xmlns', 'yl:xmpp:params']];
        var msg = $msg({
            to: ROOM_JID,
            from: jid,
            type: 'groupchat',
            id: generateMixed(10)
        }).c("body", null, val)
        .c("params", attr, null)
        .c("text", null, val);
        connection.send(msg.tree());

        $("#input-msg").val('');
    } else {
        alert("请先登录！");
        logout();
    }
}

// 获取当前时间
function getCurrentTime() {
    var today = new Date();
    var s1=today.getFullYear()+"-"+today.getMonth()+"-"+today.getDate()+" "+today.getHours()+":"+today.getMinutes()+":"+today.getSeconds();
    return s1;
}

// 群聊消息回执
function buildACKMessageWithMID(mid) {
    var attr = [['xmlns', 'http://yonglang.co/xmpp/client/reveived'], ['id', mid], ['stamp', getCurrentTime()]];
    var msg = $msg({
        to: ADMIN_JID,
        from: jid,
        type: 'groupchat'
    }).c('received', attr, null);
    connection.send(msg.tree());
}
  
$(document).ready(function() {
  
    // 通过BOSH连接XMPP服务器
    var username = $.cookie('username');
    var password = $.cookie('password');
    if (
        (typeof(username) == 'undefined') || 
        (typeof(password) == 'undefined')) {

	     window.location.href = "./login.html";
	     return ;
    } else {
    	if(!connected) {
	        connection = new Strophe.Connection(BOSH_SERVICE);
            username = username + '@' + server + '/' + resource
            connection.connect(username, password, onConnect);
	        jid = username;
	    }
    }

	$('.chat-message button').click(function(){
  		var input = $(this).siblings('span').children('input[type=text]');
  		if(input.val() != ''){
  			send(input.val());
  		}
	});

	$('.chat-message input').keypress(function(e){
  		if(e.which == 13) {
  			if($(this).val() != ''){
  				send($(this).val());
  			}
  		}
	});

    // 退出
    $("#logout").click(function() {
        if (connected) {
            connection.disconnect("offline")
        }

        logout();
    });
});