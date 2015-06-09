var server = $.cookie('server');
var BOSH_SERVICE = 'http://' + server +':5280';
var ADMIN_JID = 'admin@' + server;
var connection = null;
var connected = false;
var jid = "";
var i = 0;
var resource = 'web';
var tochatJID = $.cookie('tochatJID') + '@' + server + '/' + resource;

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
        connection.addHandler(onIq, null, 'iq', null, null, null);

        // 首先要发送一个<presence>给服务器（initial presence
        connection.send($pres().tree());
    }
}

function onIq(msg) {
    console.log('iq - msg: ' + Strophe.serialize(msg))
}
  
// 接收到<message>  
function onMessage(msg) {
    console.log('msg: ' + Strophe.serialize(msg))

    // 解析出<message>的from、type属性，以及body子元素
    var from = msg.getAttribute('from');
    var type = msg.getAttribute('type');
    var elems = msg.getElementsByTagName('params');
    var msgID = msg.getAttribute('id')

    if (type == "chat" && elems.length > 0) {
    	var body = elems[0].firstChild;
        add_message(from.substring(from.indexOf('/') + 1), 'img/demo/av1.jpg', Strophe.getText(body), true);
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
    $.removeCookie('tochatJID');
    window.location.href = './';
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
            to: tochatJID,
            from: jid,
            type: 'chat',
            id: generateMixed(10)
        }).c("body", null, val)
        .c("params", attr, null)
        .c("text", null, val);

        console.log(msg.tree())

        connection.send(msg.tree());

        add_message(jid.substring(jid.indexOf('/') + 1), 'img/demo/av1.jpg', val, true);
        $("#input-msg").val('');
    } else {
        alert("请先登录！");
        logout();
    }
}

function getHistoryMessage() {
    if(connected) {

        var attr = [['xmlns', 'urn:xmpp:archive'], ['with', '54f95f124c165e9824000dab@muc.192.168.0.31'], ['start', '2015-06-08T00:00:00.000Z']];
        var set = [['xmlns', 'http://jabber.org/protocol/rsm']]

        var msg = $iq({
            type: 'get',
            id: generateMixed(10)
        }).c('retrieve', attr, null)
        .c('set', set, null)
        .c('max', 30, null);

        console.log(msg.tree())

        connection.send(msg.tree());
    } else {
        alert("请先登录！");
        logout();
    }
}

function pushsub01() {
    if (connected) {

        // 创建节点
        // connection.pubsub.createNode('XMPP_NODE1', {'title': 'HelloWorld', 'summary': 'helloworld'})

        // 获取节点配置
        connection.pubsub.getConfig('XMPP_NODE1');

        // // 获取好友列表
        // var msg = $iq({
        //     id: generateMixed(10),
        //     type: 'get'
        // }).c('query', {'xmlns': 'jabber:iq:roster'});

    } else {
        alert("请先登陆！");
        logout();
    }
}

function subscribe01() {
    if (connected) {
        connection.pubsub.subscribe('XMPP_NODE1');
    } else {
        alert("请先登陆！");
        logout();
    }
}

function pushpub() {
    if (connected) {
        var entry = new Strophe.Builder('entry', {
            xmlns: 'http://www.w3.org/2005/Atom'
        }).c('title', null, 'hahahaha')
        .c('summary', null, 'To be, or not to be')
        .c('link', {'rel': 'alternate', 'type': 'text/html', 'href': 'http://denmark.lit/2003/12/13/atom03'})
        .up()
        .c('id', null, 'tag:denmark.lit,2003:entry-32397')
        .c('published', null, '2003-12-13T18:30:02Z')
        .c('updated', null, '2003-12-13T18:30:02Z');
        console.log('entry: ' + entry)
        connection.pubsub.publish('XMPP_NODE1', [{
            attrs: ['id', 'title', 'summary'],
            data: [entry]
        }]);
    } else {
        alert("请先登陆！");
        logout();
    }
}
  
$(document).ready(function() {
  
    // 通过BOSH连接XMPP服务器
    var username = $.cookie('username');
    var password = $.cookie('password');
    if (
        (typeof(username) == 'undefined') || 
        (typeof(password) == 'undefined')) {

	     window.location.href = "./";
	     return ;
    } else {
    	if(!connected) {
	        connection = new Strophe.Connection(BOSH_SERVICE);
            $('.panel-content li span').text(username)
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

    // 获取历史记录
    $('#history-message #button').click(function() {
        getHistoryMessage();
    });

    // 创建节点
    $('#history-message #pubsub').click(function() {
        pushsub01();
    });

    // 订阅节点
    $('#history-message #subscribe').click(function() {
        subscribe01();
    });

    // 发布
    $('#history-message #pushpub').click(function() {
        pushpub();
    });

    // 退出
    $("#logout").click(function() {
        if (connected) {
            connection.disconnect("offline")
        }

        logout();
    });
});