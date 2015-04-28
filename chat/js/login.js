$(document).ready(function() {
  
    // 通过BOSH连接XMPP服务器
    $('#btn-login').click(function() {
        var jid = $('#input-jid').val();
        var pwd = $('#input-pwd').val();

        if ((jid != '') && (pwd != '')) {
            $.cookie('username', jid);
            $.cookie('password', pwd);
            window.location.href = './index.html';
        } else {
            alert('用户名或密码不能为空');
        }
    });
});