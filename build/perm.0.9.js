var Enumberable =(function(){
	/**
	 * 循环
	 */
	function each(iterator,context){
		try{
			this._each(iterator,context);
		}catch(e){
			if(e != 'break') throw e;
		}
		return this;
	}
	function collect(iterator,context){
		var r = [];
		this.each(function(value,key){
			r.push(iterator.call(context,value,key));
		});
		return r;
	}
	return{
		each:each,
		collect:collect,
		map:collect
	};
})();

/**
 * @namespace
 * @desc 类控制器
 */
var Class = (function(){
	var _slice = [].slice;
	
	function create(property){
		if(!property.initialize){
			property.initialize = function(){};
		}
		
		var _class = function(){
			if(typeof this.initialize == 'function'){
				return this.initialize.apply(this,arguments);
			}
		};
		var args = [];
		
		args = _slice.call(arguments,1);
		//inherit
		var key=null;
		//父类的构造函数
		var _super_init = null;
		if(typeof args[0] == 'function'){
			var parent = args[0];
			_super_init = parent.prototype.initialize;
			
			if(typeof _super_init == 'function'){
				//销毁父实例的initailize;
				parent.prototype.initialize = function(){};
				
				var _this_init = property.initialize;
				property.initialize=function(){
					_super_init.apply(this,arguments);
					_this_init.apply(this,arguments);
				};
			}

			var iparent = new parent();
			//复原
			parent.prototype.initialize = _super_init;
			//销毁父类
			iparent.initialize=function(){};
			//start为了防止父类函数执行的时候，this指针变化，特意把initialize拿出来执行
			//end
			_class.prototype = iparent;
			_class.prototype.parent = parent;
			_class.prototype._super=function(){
				if(this.parent && this.parent.prototype[arguments[0]]){
					return this.parent.prototype[arguments[0]].apply(this,_slice.call(arguments,1));
				}
			};
			args = args.slice(1);
		}
		
		//mixin
		for ( var i = 0; i < args.length; i++) {
			var arg = args[i];
			if(typeof arg == 'object'){
				for(key in arg){
					_class.prototype[key] = arg[key];
				}
			}
		}
		//self
		for(key in property){
			_class.prototype[key] = property[key];
		}
//		if(!_class.prototype.initialize){
//			_class.prototype.initialize=function(){};
//		}
		_class.prototype.constructor = _class;
		
		return _class;
	}
	
	/**
	 * 单例
	 */
	function instance(className){
		if(typeof className == 'string'){
			className =eval(className);
		}
		if(typeof className ==='undefined') throw 'illegal class name';
		
		if(typeof className._instance === 'undefined'){
			className._instance = new className();
		}
		
		return className._instance;
	}
	
	return {
		/**
		 *创建新类，可继承
		 *@param {object} property -类方法，包括initilize构造函数
		 *@param {function} parent -父类，继承对象
		 *@example
		 *  //parentClass-<1>
		 *var Persion = Class.create({
		 *	initialize:function(name){
		 *		this.name = name;
		 *	},
		 *	getName:function(){
		 *		return this.name;
		 *	}
		 *});
		 *  //parentClass-<2>
		 *var Person = function(name){
		 * this.name = name;
		 *}
		 *Person.prototype.getName = function(){
		 *	return this.name;
		 *}
		 *  //inherit<1> 继承构造类。
		 *var Man=Class.create({
		 *	initilize:function(name,age){
		 *		this.parent();
		 *		this.parentClass.initilize.call(this,arguments);
		 *		this.age = age;
		 *	},
		 *	getAge:function(){
		 *		return this.age;
		 *	}
		 *},Person);
		 *  //inherit<2-1> 继承传统类第一种方式
		 *var Man1 = Class.create({
		 *	getAge:function(){
		 *		return this.age;
		 *	}
		 *},Person);
		 *  //inherit<2-2> 继承传统类第二种方式
 		 *var Man2 = Class.create({
 		 *	initilize:function(name,age){
 		 *		this.parent();
 		 *		this.age = age;
 		 *	},
		 *	getAge:function(){
		 *		return this.age;
		 *	}
		 *},Person);
		 *
		 *var Man3 = Class.create({
		 *	initialize:function(){
		 *	
		 *	}
		 *},EventUtil,ENumberable);
		 */
		create:create,
		/**
		 * 单例
		 * @param {class}
		 * @example 
		 * Class.instance(Service);
		 */
		instance:instance
	};
})();
/**
 * 扩展静态方法
 * @param {function/Class} -className/ModuleName/Object
 * @param {object} -staticProperty -静态属性
 * @example
 * Class.extend(Dom,{
 * 	create:function(nodeName){
 * 		reutrn document.createElement(nodeName);
 * }
 * })
 */
Class.extend=function(className,staticProperty){
	for(var key in staticProperty){
		className[key] = staticProperty[key];
	}
	return className;
};

/**
 * 扩展each
 */
(function(){
	var __props = Array.prototype;
	Class.extend(__props,Enumberable);
	__props._each = __props.forEach;
	if(!__props._each){
		function _each(iterator,context){
			for ( var i = 0; i < this.length; i++) {
				iterator.call(context,this[i],i);
			}
		}
		__props._each = _each;
	}
	__props.indexOf = __props.indexOf;
	if(!__props.indexOf){
		__props.indexOf = function(value){
			var index = -1;
			this.each(function(v,i){
				if(v == value){
					index = i;
					throw 'break';
				}
			});
			return index;
		};
	}
	Class.extend(__props,{
		has:function(value){
			if(this.indexOf(value) == -1){
				return false;
			}
			return true;
		},
		merge:function(arr,unique){
			var new_arr = [];
			var to_do=function(v){
				if(new_arr.indexOf(v)==-1 && unique){
					new_arr.push(v);
				}
			};
			this.each(to_do);
			arr.each(to_do);
			return new_arr;
		},
		/**
		 * 根据回调删除元素
		 * @param fn
		 * @returns {___anonymous568_1147}
		 */
		remove_by:function(fn){
			var cache = [];
			this.each(function(v,i){
				if(fn(v,i)){
					cache.push(v);
				}
			});
			var source = this;
			cache.each(function(v){
				source.splice(source.indexOf(v),1);
			});
			
			return this;
		},
		/**
		 * 移除第一个元素
		 */
		remove_item:function(item,all){
			while(this.indexOf(item)>-1){
				this.splice(this.indexOf(item),1);
				if(all){
					break;
				}
			}
			return this;
		},
		clone:function(){
			return this.concat([]);
		}
	});
})();
/**
 * 扩展fn
 */
(function(){
	var __props = Function.prototype;
	var _ex_fn = {
		/**
		 * 防止fn.proxy()!== fn.proxy()出现，做了缓存
		 * @param context
		 * @returns
		 */
		proxy:function(context){
			var fn = this;
			if(typeof fn.__proxy =='undefined'){
				fn.__proxy = {};
			} 
			if(!fn.__proxy[context]){
				fn.__proxy[context] =function(){
					return fn.apply(context,arguments);
				};
			}
//			return function(){
//				fn.apply(context,arguments);
//			};
			return fn.__proxy[context];
		},
		curry:function(){
			var fn = this;
			var args = arguments;
			return function(){
				return fn.apply(null,args);
			};
			/*var context = this;
			var fn = this,args = [];
			if(arguments.length){
				context = arguments[arguments.length-1];
				
				var _slice = [].slice;
				args = _slice.call(arguments,0,-1);
			}
			
			return function(){
				fn.apply(context,args);
			};*/
		},
		/**
		 * 
		 * @param time
		 * @param context
		 * @example
		 * setTimeout(function(){
		 * 	this.getData();
		 * },2000);
		 * this.getData.delay(2000);
		 */
		delay:function(time,context){
			var fn = this;
			if(fn.__timeout){
				clearTimeout(fn.__timeout);
			}
			fn.__timeout = setTimeout(fn.proxy(context),time);
		}
	};
	
	Class.extend(__props,_ex_fn);
})();

(function(){
	var __props = String.prototype;
	var _ex_string = {
	};
	Class.extend(__props,_ex_string);
})();
(function(){
//	var __props = RegExp.prototype;
})();
var Utils = (function(){
	function try_these(){
	    var returnValue=null;
	    for (var i = 0, length = arguments.length; i < length; i++) {
	      var lambda = arguments[i];
	      try {
	        returnValue = lambda();
	        break;
	      } catch (e) { }
	    }
	    return returnValue;
	}
	function extend(source,target){
		for ( var key in target) {
			source[key] = target[key];
		}
		return source;
	}
	//生成随机字符串
	function random_string(length) {
	    var chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz'.split('');
	    
	    if (! length) {
	        length = Math.floor(Math.random() * chars.length);
	    }
	    
	    var str = '';
	    for (var i = 0; i < length; i++) {
	        str += chars[Math.floor(Math.random() * chars.length)];
	    }
	    if(this._random_list.indexOf(str)>-1){
	    	return random_string(length);
	    	return;
	    }
	    this._random_list.push(str);
	    return str;
	}
	//获取鼠标位置
	function event2point(e){ 
		e = e||window.event; 
		return { 
			x:e.clientX+document.body.scrollLeft+document.documentElement.scrollLeft, 
			y:e.clientY+document.body.scrollTop+document.documentElement.scrollTop 
		}; 
	}
	function _deep_copy_object(source){
		var target = {};
		for(var key in source){
			var item =source[key];
			if(typeof item =='object'){
				if(typeof item.slice=='function'){
					target[key] = arguments.callee(item);	
				}else{
					target[key] = _deep_copy_array(item);
				}
			}else{
				target[key] = source[key];
			}
		}
		return target;
	}
	function _deep_copy_array(source){
		var target = [];
		for(var i=0;i<source.length;i++){
			var v = source[i];
			if(typeof v == 'object'){
				if(typeof item.slice == 'function'){
					target[i] = arguments.callee(item);
				}else{
					target[i] = _deep_copy_array(item);
				}
			}else{
				target[i] = v;
			}	
		}
		return target;
	}
	function deep_copy(source){
		if(typeof source == 'object'){
			if(typeof source.slice=='function'){
				console.log(source);
				return _deep_copy_object(source);
			}else{
				return _deep_copy_array(source);
			}
		}
		return source;
	}
		
	return {
		_random_list:[],
		deep_copy:deep_copy,
		try_these:try_these,
		extend:extend,
		random_string:random_string,
		event2point:event2point
	};
})();

/**
 * var SubWindow = {
 * 	
 * }
 * var Eventer = {
 * 
 * extend:function(Obj){
 * for(var key in EventDispatcher){
 * 	Obj[key] = EventDispatcher[key];
 * }
 * }
 */

var EventDispatcher=(function(){
	return {
		_dispatched:{},
		createEvent:function(type,data){
			var e = {};
			e.type = type;
			e.data = data;
			return e;
		},
		/**
		 *   
		 * @param {IGEvent}e - 事件
		 */ 
		dispatchEvent:function(event,data,target,sync){
			//for aync execution.
			if(!sync){
				var self=this;
				setTimeout(function(){
					self.dispatchEvent(event, data, target, true);
				},0);
				return;
			}
			if(!this._eventHandler){
				this._eventHandler = {};
			}
			
			if(typeof event == 'string'){
				this._dispatched[event] = 1;
				event = this.createEvent(event,data);
			}
			
			if(!target){
				target = this;
			}
			event.target = target;
			
			var name = event.type;
			var functions = this._eventHandler[name];
			if(typeof functions =='undefined') return this;
			
			for(var i=0;i<functions.length;i++){
				var lambda = functions[i];
				if(typeof lambda == 'function'){
					lambda(event);
				}
			}
			return this;
		},
		/**
		 * 
		 * @param {string} eventName
		 * @param handler
		 */
		addEventListener:function(type,handler,useCapture,context){
			if(this._EVENT_LIST && this._EVENT_LIST.indexOf(type.toLowerCase())>-1){
					this.each(function(dom){
						if(document.addEventListener){
							dom.addEventListener(type,handler,useCapture);
						}else if(document.attachEvent){
							dom.attachEvent('on'+type,handler);
						}
					});
					return;
			}
			if(!this._eventHandler){
				this._eventHandler = {};
			}
			
			this._eventHandler[type] = this._eventHandler[type] ||[];
			
			this._eventHandler[type].push(handler);
			return this;
		},
		removeEventHandler:function(eventName,handler){
			if(!this._eventHandler){
				this._eventHandler = {};
			}
			var arr = this._eventHandler[eventName]||[];
			arr.each(function(v,i){
				if(v == handler){
					arr.splice(i,1);
					throw 'break';
				}
			});
			return this;
		},
		__alias_event:function(){
			this.bind = this.addEventListener;
			this.unbind = this.removeEventListener;
			this.trigger =this.fire=this.dispatchEvent;
		}
	};
})();
//import utils.js
//import class.js
//import enumberable.js
//import eventdispatcher.js
var Perm =(function(){
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
		__alias_event:function(){
			this.bind = this.addEventListener;
			this.trigger = this.dispatchEvent;
			this.unbind = this.removeEventListener;
		}
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
	};
	var Service = Class.create(_service_property,PermObserver);
	return {
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
			this._is_runing = true;	
			//绑定hash事件
			this._instance_all();
			//绑定所有事件
			this.rules.each(this._run_rule.proxy(this));
			this._hash_changed();
			//执行默认的事件
			this._default.each(this._do_hash_rule.proxy(this));
		},
		/**
		 *@desc -初始化所有的对象
		 */
		_instance_all:function(){
			for(var view in this.__views){
				this._views[view] = Class.instance(this.__views[view]);
			}	
			for(var service in this.__services){
				this._services[service] = Class.instance(this.__services[service]);
			}
		},
		/**
		 *@example 
		 * Perm.register('todo.view',todo_property,enumberable);
		 */
		register:function(name,property,ex){
			ex = ex||[];
			if(!/service|view/i.test(name)) throw 'illigal instance target:'+name;
			var names = name.split(".");
			var parent_class = name[1] == 'view'?View:Service;
			var klass = Class.create.apply(null,[property,parent_class].concat(ex));
			name = names[0];
			if(/view/i.test(names[1])){
				this.__views[name] = klass;
				if(this._is_runing){
					this._views[name] = Class.instance(klass);
				}
			}else{
				this.__services[name] = klass;
				if(this._is_runing){
					this._services[name] = Class.instance(klass);
				}
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
		add_rules:function(rules){
			this.rules = this.rules.concat(rules);
			if(this._is_runing){
				rules.each(this._run_rule.proxy(this));
			}
		},
		_run_rule:function(rule){
			var arr = rule.split('/');
			if(this._is_runing){
				var event_target = this.get(arr[0]),
					recive_target = this.get(arr[2]);
				event_target.bind(arr[1],recive_target[arr[3]].proxy(recive_target));
			}
			return this;
		},
		_hash_changed:function(){
			$(window).on('hashchange',this._hash_change_handler.proxy(this));
		},
		_hash_change_handler:function(){
			for(var key in this.hash_rules){
				if(key == 'default') continue; 
				var pattern = new RegExp(key,'i'),
					result = pattern.exec(window.location.hash);
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
			params = params||[];
			var target = this.get(action);
			target[fn].apply(target,params);
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
		},
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

})();
//主要运行函数
(function(){
	$(document).ready(function(){
		Perm.run();
	});
})();

