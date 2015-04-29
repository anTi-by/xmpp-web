$(document).ready(function() {
  
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
            window.location.href = './index.html';
        } else {
            alert('用户名或密码不能为空');
        }
    });
});