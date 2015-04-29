$(document).ready(function() {

    var username = $.cookie('username');
    var password = $.cookie('password');

    if (
        (typeof(username) == 'undefined') || 
        (typeof(password) == 'undefined')) {

    } else {
        window.location.href = './muc.html'
    }
  
    // 通过BOSH连接XMPP服务器
    $('#btn-login').click(function() {
        var jid = $('#input-jid').val();
        var pwd = $('#input-pwd').val();
        var server = $('select option:selected').val();
        var room_name = $('#room_name').val();

        if ((jid != '') && (pwd != '')) {
            $.cookie('username', jid);
            $.cookie('password', pwd);
            $.cookie('server', server);
            $.cookie('room_name', room_name);
            window.location.href = './muc.html';
        } else {
            alert('用户名或密码不能为空');
        }
    });
});