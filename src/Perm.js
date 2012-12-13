//import utils.js
//import class.js
//import enumberable.js
//import eventdispatcher.js
var Perm = {
	/**
	 * @private
	 * @desc saved View instance
	 */
	_views:{},
	/**
	 * @private
	 * @desc saved Class of View
	 */
	__views:{},
	_services:{},
	__services:{},
	_is_runing:false,
	/**
	 *
	 */
	hash_rules:{},
	rules:[],
	/**
	 *默认执行
	 */
	_default:[],
	/**
	 *	
	 */
	run:function(){
		//绑定hash事件
		this._hash_changed();
		//执行默认的事件
		this._default.each(function(item){
			this._do_hash_rule(item);
		},this);
		this._is_runing = true;	
	},
	/**
	 *@example 
	 * Perm.register('todo.view',todo_property,enumberable);
	 */
	register:function(name,property,ex){
		ex = ex||[];
		if(!/model|view/i.test(name)) throw 'illigal instance target';
		
		var klass = Class.create.call(null,[property].concat(ex));
		var names = name.split(".");
		name = names[0];
		if(/view/i.test(names[1])){
			this.__views[name] = klass;
			this._views[name] = Class.instance(klass);
		}else{
			this.__services[name] = klass;
			this._services[name] = Class.instance(klass);
		}
	},
	/**
	 *@desc 设置直接执行的规则或者设置默认起始规则
	 */
	init_with:function(rule){
		this._default.push(rule);		
		if(this._is_runing){
			this._do_hash_rule(rule);
		}
	},
	/**
	 * @desc 设置hash规则。默认default 直接在ready 后执行
	 *{
	 	default:'todoservice/getname',
		/say[\w]+/:'todoservice/say',
		'id\/(\d+)\/':'todolist.view/get_data_by_id',
		/#!\/(\w+)/say/:function(args){
			Perm.view('say').change(args[1]);	
		}
	  }
	 *
	 */
	set_hash_rules:function(rules){
		this.hash_rules = rules;	
		if(rules['default']){
			if(typeof rules['default'] == 'object'){
				this._default = this._default.merge(rules['default']);
			}
		}
		return this;
	},
	/**
	 * @desc 普通事件规则,就是view和service之间的绑定
	*[
		todo.view/itemdelete/todo.service/itemdelete
		todo.service/todo.view/data:got
	]		
	 *
	 */
	set_rules:function(rules){
		this.rules = rules;
		rules.each(function(rule){
			var arr = rule.split('/');
			this.get(arr[0]).bind(arr[1],this.get(arr[2])[arr[3]]);
		},this);
	},
	_hash_changed:function(){
		$(window).on('hashchange',this._hash_change_handler.proxy(this));
	},
	_hash_change_handler:function(){
		for(var key in this.hash_rules){
			if(key == 'default') continue; 
			var pattern = new RegExp(key,'i'),
				result = patter.exec(window.location.hash);
				result = result.slice(1);
			if(result){
				this._do_hash_rule(this.hash_rules[key],result);
				return true;
			}	
		}	
	},
	/**
	 *执行某一条hash规则
	 */
	_do_hash_rule:function(rule,result){
		if(typeof rule == 'function'){
			rule();
		}else{
			var as = rule.split('/');
			var action = as[0],fn = as[1];
			this._call_function(action,fn,result);
		}	
	},
	/*
	 *
	 *@desc 调用某个view/service的方法,一般说是被hash_rules调用
	 */
	_call_function:function(action,fn,params){
		this.get(action)[fn].apply(null,params);	
	},
	trace:function(things){
		if(!!console){
			console.log(things);
		}
	},
	/**
	 *@param name{string} -view的名称
	 *@example Perm.get('todo.view');
	 */
	get:function(arg){
		var arr = arg.split('.');
		var name=arr[0],cate = arr[1];

		if(/view/i.test(cate)){
			return this.view(name);
		}
		return this.service(name);
	}
	/**
	 *@example Perm.view("todo");
	 */
	view:function(name){
		return this._views[name];
	},
	service:function(name){
		return this._services[name];
	}
};
var PermObserver =  Class.create({
	initialize:function(){
	   this.__alias_event(); 
	},
	_ex:function(target){
		//保持独立，没有用hash
		for(var key in target){
			this[key] = target;
		}
	},
},EventDispatcher);
var _view_property = {
	/**
	 *@param
	 *@example
	* {
	* ctrl:'#ctrl-btn',
	* save:'.save-btn'
	* }
	 */
	selector:{},
	_selector:{},
	/**
	 *['name/click/say,'word/mouseover/show']
	 */
	e:{},
	/**
	 * @param *args{Object}
	 */
	initialize:function(args){
		this._ex(args);
		this._init_all_selector();
	},
	get:function(name){
		return this.selector[name];
	},
	set:function(name,dom){
		this._selector[name] = dom;
		return this;
	},
	_init_all_selector:function(){
		for(var key in this.selector){
			//用了$选择器
			this._selector[key] = $(this.selector[key]);			
		}
	},
	_init_events:function(){
		//use jquery's on
		this.e.each(this._init_event,this);
	},
	_init_event:function(item){
		try{
			var arr = item.split('/');
			if(arr.length==3){
				this._selector[arr[0]].on(arr[1],this[arr[2]+'_handler']);
			}else{
				this._selector[arr[0]].on(arr[1],arr[2],this[arr[3]+'_handler']);
			}
		}catch(e){
			Perm.trace(e);
		}
	},
	/**
	 * 单独添加一条解析
	 */
	add_event:function(config){
		this._init_event(config);
		return this;
	},
	/**
	 *@desc 取消绑定
	 *@param -config{string}
	 */
	remove_event:function(config){
		var arr = config.split('/');
		this._selector[arr[0]].off(arr[1]);

		return this;
	}
};
var View = Class.create(_view_property,PermObserver);

/**
 *
 */
var _service_property = {
	this.initialize(){
		this.__alias_event();
	}	
};
var Service = Class.create(_service_property,PermObserver);
//主要运行函数
(function(){
	$(document).ready(function(){
		Perm.run();
	});
});
