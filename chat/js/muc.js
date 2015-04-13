function request(paras){
	var url = location.href;
	var paraString = url.substring(url.indexOf("?")+1,url.length).split("&");

	var paraObj = {}
	for (i=0; j=paraString[i]; i++){
		paraObj[j.substring(0,j.indexOf("=")).toLowerCase()] = j.substring(j.indexOf
		("=")+1,j.length);
	}
	var returnValue = paraObj[paras.toLowerCase()];
	if(typeof(returnValue)=="undefined"){
		return "";
	}else{
		return returnValue;
	}
}

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

function ServiceAdministration() {
	var host = "sess-man@192.168.0.27"
	this.node_prefix = 'http://jabber.org/protocol/admin#';
	this.nodes = {
		ADD_USER: 'add-user',
	    DELETE_USER: 'delete-user',
	    DISABLE_USER: 'disable-user',
	    REENABLE_USER: 'reenable-user',
	    END_USER_SESSION: 'end-user-session',
	    GET_USER_PASSWORD: 'get-user-password',
	    CHANGE_USER_PASSWORD: 'change-user-password',
	    GET_USER_ROSTER: 'get-user-roster',
	    GET_USER_LASTLOGIN: 'get-user-lastlogin',
	    USER_STATS: 'user-stats',
	    EDIT_BLACKLIST: 'edit-blacklist',
	    EDIT_WHITELIST: 'edit-whitelist',
	    GET_REGISTERED_USERS_NUM: 'get-registered-users-num',
	    GET_DISABLED_USERS_NUM: 'get-disabled-users-num',
	    GET_ONLINE_USERS_NUM: 'get-online-users-num',
	    GET_ACTIVE_USERS_NUM: 'get-active-users-num',
	    GET_IDLE_USERS_NUM: 'get-idle-users-num',
	    // Ejabberd 实现方式和XEP-0133标准有却别
	    GET_REGISTERED_USERS_LIST_EJABBERD: 'all users',
	    GET_REGISTERED_USERS_LIST: 'get-registered-users-list',
	    GET_DISABLED_USERS_LIST: 'get-disabled-users-list',
	    GET_ONLINE_USERS_LIST: 'get-online-users-list',
	    GET_ACTIVE_USERS: 'get-active-users',
	    GET_IDLE_USERS: 'get-idle-users',
	    ANNOUNCE: 'announce',
	    SET_MOTD: 'set-motd',
	    EDIT_MOTD: 'edit-motd',
	    DELETE_MOTD: 'delete-motd',
	    SET_WELCOME: 'set-welcome',
	    DELETE_WELCOME: 'delete-welcome',
	    EDIT_ADMIN: 'edit-admin',
	    RESTART: 'restart',
	    SHUTDOWN: 'shutdown'
	  };
	this.base_iq = {
    	xmlns: 'jabber:client',
    	type: 'set',
    	to: host
  	};
  	this.getCopyBaseIQ = function () {
    	return JSON.parse(JSON.stringify(this.base_iq));
  	};
  	this.getCommand = function (node) {
    	return Strophe.xmlElement('command', {
        	xmlns: 'http://jabber.org/protocol/commands',
        	action: 'execute',
        	node: this.node_prefix + node
    	});
  	};
  	this.send = function (iq) {
    	connection.send(iq.tree());
  	};
  	this.addUser = function () {
    	var iq_attributes = this.getCopyBaseIQ();
    	iq_attributes.from = jid;
    	iq_attributes.to = host;
    	var iq = $iq(iq_attributes).cnode(this.getCommand(this.nodes.ADD_USER));
    	this.send(iq);
  	};
  	this.getRegisterUserNumber = function () {
    	var iq_attributes = this.getCopyBaseIQ();
    	iq_attributes.from = jid;
    	iq_attributes.to = host;
    	var iq = $iq(iq_attributes).cnode(this.getCommand(this.nodes.GET_REGISTERED_USERS_NUM));
    	this.send(iq);
  	};
  	this.getRegisterUserList = function () {
    	var iq_attributes = this.getCopyBaseIQ();
    	iq_attributes.from = jid;
    	iq_attributes.to = host;
    	var iq = $iq(iq_attributes).cnode(this.getCommand(this.nodes.GET_REGISTERED_USERS_LIST));
    	this.send(iq);
  	};
  	/**
  	 * Ejabberd实现方式不兼容XEP-0133, Ejabberd采用Disco服务发现机制获取注册用户列表
   	 */
  	this.getRegisterUserList2 = function () {
    	var iq_attributes = this.getCopyBaseIQ();
    	iq_attributes.from = jid;
    	iq_attributes.to = host;
    	iq_attributes.type = 'get';
    	var iq = $iq(iq_attributes).c('query', {
      		xmlns: 'http://jabber.org/protocol/disco#items',
      		node: this.nodes.GET_REGISTERED_USERS_LIST_EJABBERD
    	});
    	this.send(iq);
  	};
};

var BOSH_SERVICE = 'http://192.168.0.27:5280';

// 房间JID
var ROOM_JID = '54f95f124c165e9824000dab@muc.192.168.0.27';

var connection = null;

var connected = false;

// 当前登录的JID
var jid = "";

// 连接状态改变的事件  
function onConnect(status) {
    if (status == Strophe.Status.CONNFAIL) {  
        alert("连接失败！");  
    } else if (status == Strophe.Status.AUTHFAIL) {  
        alert("登录失败！");  
    } else if (status == Strophe.Status.DISCONNECTED) {  
        alert("连接断开！");  
        connected = false;  
    } else if (status == Strophe.Status.CONNECTED) {  
        connected = true;  
          
        // 当接收到<message>节，调用onMessage回调函数  
        connection.addHandler(onMessage, null, 'message', null, null, null);  
          
        // 首先要发送一个<presence>给服务器（initial presence）  
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

    if (type == "groupchat" && elems.length > 0) {
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
    }
}
  
$(document).ready(function() {
  
    // 通过BOSH连接XMPP服务器
    if ((request("jid") === '') || (request("pwd") == '')) {
	    window.location.href = "./login.html";
	    return ;
    } else {
    	if(!connected) {
	        connection = new Strophe.Connection(BOSH_SERVICE);
	        connection.connect(request("jid"), request("pwd"), onConnect);
	        jid = request("jid");
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

    // 退出
    $("#btn-logout").click(function() {
        if (connected) {
            connection.disconnect("offline")
        }
    });
});