$(document).ready(function() {

    var username = $.cookie('username');
    var password = $.cookie('password');

    if (
        (typeof(username) == 'undefined') || 
        (typeof(password) == 'undefined')) {

    } else {
        window.location.href = './chat.html'
    }
  
    // 通过BOSH连接XMPP服务器
    $('#btn-login').click(function() {
        var jid = $('#input-jid').val();
        var pwd = $('#input-pwd').val();
        var server = $('select option:selected').val();
        var tochatJID = $('#tochatJID').val();

        if ((jid != '') && (pwd != '')) {
            $.cookie('username', jid);
            $.cookie('password', pwd);
            $.cookie('server', server);
            $.cookie('tochatJID', tochatJID);
            window.location.href = './chat.html';
        } else {
            alert('用户名或密码不能为空');
        }
    });
});