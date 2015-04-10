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
        alert("连接成功，可以开始聊天了！");  
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
      
    console.log(msg);  
    // 解析出<message>的from、type属性，以及body子元素  
    var from = msg.getAttribute('from');  
    var type = msg.getAttribute('type');  
    var elems = msg.getElementsByTagName('body');  
  
    if (type == "groupchat" && elems.length > 0) {  
        var body = elems[0];  
        $("#msg").append(from.substring(from.indexOf('/') + 1) + ":<br>" + Strophe.getText(body) + "<br>")  
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
  
$(document).ready(function() {  
  
    // 通过BOSH连接XMPP服务器  
    $('#btn-login').click(function() {
    	console.log(connected)  
        if(!connected) {
        	console.log("xxxx")
            connection = new Strophe.Connection(BOSH_SERVICE);
            connection.connect($("#input-jid").val(), $("#input-pwd").val(), onConnect);
            console.log(connection)
            jid = $("#input-jid").val();
        }  
    });  
      
    // 发送消息  
    $("#btn-send").click(function() {  
        if(connected) {  
  
            // 创建一个<message>元素并发送
            // <params messagetype="0" xmlns="yl:xmpp:params"><text>aaaa</text></params> 
            var attr = [['messagetype', '0'], ['xmlns', 'yl:xmpp:params']]
            var msg = $msg({  
                to: ROOM_JID,   
                from: jid,   
                type: 'groupchat',
                id: generateMixed(10)
            }).c("body", null, $("#input-msg").val())
            .c("params", attr, null)
            .c("text", null, $("#input-msg").val());  
            connection.send(msg.tree());

            $("#input-msg").val('');  
        } else {  
            alert("请先登录！");  
        }  
    });

    // 退出
    $("#btn-logout").click(function() {
        if (connected) {
            connection.disconnect("offline")
        }
    });
});