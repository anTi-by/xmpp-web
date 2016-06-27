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
  	
    //Ejabberd实现方式不兼容XEP-0133, Ejabberd采用Disco服务发现机制获取注册用户列表
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