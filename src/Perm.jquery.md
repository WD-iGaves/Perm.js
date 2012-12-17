#Perm.js #
Perm.js是前端分层框架。(测试中)

框架内包含View & Service类。
所有的类实现自[class.js](https://github.com/Wcolor/Perm.js/blob/master/src/class.js "class.js"),

View类实现：

`Perm.register("deml.view"，{
	initialize:function(){
		//do something
	}
},ex_module);`

Service类实现:

`Perm.register("demo.service",{
	initialize:function(){
		//do something
	}
},ex_module);`

**Service&View无法实例化，必须走注册实现。**

# Perm #

## Perm.register(name,property,*ex) ##
**注册view&service**
name中必须带有.view .service来表示类型。

例如：
`Perm.register("demo.view"，demo_view_proto,Enumberable)`
## Perm.init_with(rule) ##
**设置初始化执行函数** rule规则确定，必须是以'/'来划分的运行规则

例如
`Perm.init_with('demo.service/load_data');`

## Perm.add_rules(rules) ##
**设置运行中执行规则** rules为数组。为rule的集合

例如
`Perm.add_rules([
	'content.view/request:next/content.service/get_next',
	'content.service/data:got/content.view/set_content_data'
]);`

## Perm.set_hash_rules(hash_rules) ##
**设置hash触发规则**
此规则触发，需要监听windows onhashchange触发，一般作为单页面Webapp执行。默认default为直接执行。

`Perm.set_hash_rules({
			default:'todoservice/getname',
			/say[\w]+/:'todoservice/say',
			'id\/(\d+)\/':'todolist.view/get_data_by_id',
			/#!\/(\w+)/say/:function(args){
				Perm.view('say').change(args[1]);	
			}
		  });`

## Perm.get(instance_name) ##

**获取实例化后的对象**
`Perm.get('demo.service')`
`Perm.get('demo.view')`

## Perm.service(name)&Perm.view(name) ##
**直接获取对应实例**
`Perm.view("demo");Perm.service("demo")`

# View: #

view包含浏览器事件，Dom绘制等等处理
##.selector##
默认选择器，object,会按照key存储起来被选择的内容

`{

'say_btn':".ctrl a.btn"

'close':".close"

}`

## .add_event(event_rule) & .remove_event(event_rule)##

**添加一条绑定规则**

`this.add_event/remove_event("say_btn/click/say");`

**delegate**

`this.add_event/remove_event("say_btn/a/click/say")`








