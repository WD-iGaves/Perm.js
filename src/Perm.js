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
					//proxy
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
			ex = Array.prototype.slice.call(arguments,2)||[];
			if(!/service|view/i.test(name)) throw 'illigal instance target:'+name;
			var names = name.split(".");
			var parent_class = name[1] == 'view'?View:Service;
			var klass = Class.create.apply(null,[property,parent_class].concat(ex));
			name = names[0];
			if(/view/i.test(names[1])){
				this.__views[name] = klass;
				if(this._is_runing){
					this._views[name] = Class.instance(klass);
					this._do_hash_rule(name+'.view/_init_all_selector');
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
		init_with:function(rule,args){
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