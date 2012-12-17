#Perm.js #
Perm.js是前端分层框架。

框架内包含View & Service类。
所有的类实现自[class.js](https://github.com/Wcolor/Perm.js/blob/master/src/class.js "class.js"),

View类实现：
`
Perm.register('deml.view'，{
	initialize:function(){
		//do something
	}
},ex_module);

`
Service类实现:
`
Perm.register('demo.service',{
	initialize:function(){
		//do something
	}
},ex_module);

`
**Service&View无法实例化，必须走注册实现。**