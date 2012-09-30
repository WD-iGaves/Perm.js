var View = Class.create({
	initialize:function(){
		this.__alias_event();
		this.m = null;
		/**
		 * 事件监听规则
		 * 选择器；事件名称；处理函数（会自动补齐_handler）;
		 * 注意：选择器会从this.m里面直接查找find。这里的定义规则可能后续会变化。
		 * @example
		 * this._event_rule = {
		 * 	dom1:["#id eventname[ser=sdf];click;list_click",
		 * 		"ul li;click;list_item"]
		 * };
		 */
		this._event_rule = {};
		/**
		 * 事件代理规则。。必须有代理函数。。
		 * 目标选择器;事件(用mouseover会死);处理函数(会自动补齐_handler)
		 * @example
		 * this._delegate_rule = {
		 * 	dom1:["#id eventname[ser=sdf];click;list_click",
		 * 		"ul li;click;list_item"]
		 * };
		 */
		this._delegate_rule = {};
	},
	/**
	 * 设置监听规则;
	 * @param rule
	 */
	set_event_rule:function(rule,base){
		
		base = base||'default';
		this._analysis_delegate();
		this._analysis_event(rule,base);
		if(this._event_rule[base]){
			this._event_rule[base] = this._event_rule[base].merge(rule);
		}else{
			this._event_rule[base] = rule;
		}
		
		return this;
	},
	set_delegate_rule:function(rule,base){
		base = base||'default';
		this._analysis_delegate(rule,base);
		
		if(this._delegate_rule[base]){
			this._delegate_rule[base] = this._delegate_rule[base].merge(rule);
		}else{
			this._delegate_rule[base] = rule;
		}
		
		return this;
	},
	/**
	 * 处理事件规则。
	 * 用addEventListener做监听
	 * @param {Array}rules -规则。
	 * @param {Dom}base -查找范围节点。
	 */
	_analysis_event:function(rules,base){
		base = base||$(document.body);
		rules.each(function(rule){
			rule = rule.split(";");
			if(rule.length!==3){
				return;
			}
			
			var dom = base?base.find(rule[0]):new Dom(rule[0]);
			var ename = rule[1];
			var handler = this[rule[2]+"_handler"].proxy(this);
			if(!dom && !ename &&!handler){
				return;
			}
			
			dom.addEventListener(ename,handler);
		},this);
		
		return this;
	},
	/**
	 * 分析代理的事件规则
	 * 用delegate做监听
	 * @param rules
	 * @returns {___anonymous24_1851}
	 */
	_analysis_delegate:function(rules,base){
		base = base||$(document.body);
		rules.each(function(rule){
			rule = rule.split(";");
			if(rule.length!==3){
				return;
			}
			var selector = rule[0];
			var ename = rule[1];
			var handler = this[rule[2]+"_handler"].proxy(this);
			if(!selector && !ename &&!handler){
				return;
			}
			if(ename == 'mouseover'){
				throw 'deny';
			}
			
			base.delegate(selector,ename,handler);
		},this);
		return this;
	}
},EventDispatcher);

var Service = Class.create({
	initialize:function(){
		this.__alias_event();
	}
},EventDispatcher);

var Model = Class.create({
	//公共方法
	attr:function(){
		
	},
	//私有方法
	_attr:function(key,value){
		if(key && value){
			this.__attr.push(key);
			this["_"+key] = value;
			return this;
		}
	},
	initialize:function(props,url){
		//标记缓存
		this.__attr = [];
	},
	_each:function(iterator,context){
		for ( var i = 0; i < this.__attr.length; i++) {
			var key = this.__attr[i];
			if(!/_/.test(key)){
				iterator.call(context,this[this.__attr[i]],this.__attr[i]);
			}
		}
	}
},Service);
var Connect = Class.create({
	initialize:function(views,services){
		this.views = views||{};
		this.services = services||{};
		this.ex_listener_suffix = "_handler";
		this.__alias();
	},
	/**
	 * 设置view
	 * @param key
	 * @param view
	 */
	set_view:function(key,view){
		if(typeof arguments[0] == 'object'){
			this._set_views(arguments[0]);
		}else{
			this.views[key] = view;
		}
		return this;
	},
	_set_views:function(views){
		var h = Hash.create(views);
		h.each(function(value,key){
			this.views[key] = value;
		},this);
		return this;
	},
	get_view:function(key){
		return Class.instance(this.views[key]);
	},
	/**
	 * 设置service
	 * @param key
	 * @param service
	 * @returns {___anonymous180_774}
	 */
	set_service:function(key,service){
		if(typeof arguments[0] == 'object'){
			this._set_services(arguments[0]);
		}else{
			this.services[key] = service;
		}
		return this;
	},
	_set_services:function(services){
		var h = Hash.create(services);
		h.each(function(value,key){
			this.services[key] = value;
		},this);
		return this;
	},
	/**
	 * @example
	 * connect.ss(click,listView,listService);
	 */
	get_service:function(key){
		return Class.instance(this.services[key]);
	},
	/**
	 * 
	 */
	_instance_by:function(key){
//		console.log(key);
		
		var instance = this.services[key];
		if(!instance){
			instance = this.views[key];
		}
		return Class.instance(instance);
	},
	/*listen_service:function(event,v,s){
		var view = this.get_view(v),service = this.get_service(s);
		view.addEventListener(event,service[event+"_listen"].proxy());
		return this;
	},
	listen_view:function(event,s,v){
		var view = this.get_view(v),service = this.get_service(s);
		service.addEventListener(event,view[event+"_listen"].proxy());
		return this;
	},*/
	/**
	 * 链接
	 * @param dispatcher{string} - key
	 * @param listener{string} - key
	 * @or
	 * 
	 */
	connect:function(dispatcher,listener,event){
		var d = this._instance_by(dispatcher);
		var l = this._instance_by(listener);
		if(typeof l[event+this.ex_listener_suffix] == 'undefined') throw 'no listener defined in dispatcher(没有定义接收函数)';
		d.addEventListener(event,l[event+this.ex_listener_suffix].proxy(l));
		return this;
	},
	/**
	 * 自动分析链接
	 * @param rule
	 * @returns {___anonymous221_2572}
	 * @example
	 * 	page_connect.set_view({});
	 * 	page_connect.set_service({});
	 * 	page_connect.analysis([
	 * 	"service;view;datachange,eventer
	 * ]);
	 */
	analysis:function(args){
		this.set_service(args.service);
		this.set_view(args.view);
		this.connect_rule = args.rule;
		this.connect_rule.each(function(value){
			value = value.split(';');
			var v = value[2].split(',');
			var _value = value.slice(0,2);
			v.each(function(e){
				var args = _value.concat([e]);
				this.connect.apply(this,args);
			},this);
		},this);
		
		Hash.each(args._default,function(v,k){
			var default_instance = this._instance_by(k);
			default_instance[v]();
		},this);
//		var default_instance = this._instance_by(args['defalut'])
		return this;
	},
	/**
	 * 通过事件进行链接绑定
	 */
	__alias:function(){
//		this.ss = this.set_service;
//		this.sv = this.set_view;
//		this.gv = this.get_view;
//		this.gs = this.get_service;
//		this.c = this.connect;
//		this.a = this.analysis;
	}
});

var Router = (function(){
	/**
	 * @class 路由选择
	 */

	var router = {
		initialize:function(){
			//历史url的hash
			this.history = '';
			//支持判定
			this._is_not_support = function(){
				if( ('onhashchange' in window) && ((typeof document.documentMode==='undefined') || document.documentMode==8)) {
					return false;
				}
				return true;
			}();
			//路由表
			this.tables = {};
			//起默认的监听||定时器。
			
			if(this._is_not_support){
				this._hack_interval=setInterval(this._check_hash_change.proxy(this),16);
			}else{
				window.addEventListener('hashchange',this._do_onchanged.proxy(this));
			}
			
			this.__alias_event();
			return this;
		},
		/**
		 * 获取url的相关信息
		 * {source:url,
		 * 	param:{id:112,name:wangdong}
		 * 	hash:[aac,ddb,bbs,aac]
		 * }
		 * @return {Object}
		 */
		_get_url_detail:function(){
			var href=window.location.href;
			var pattern = /http:\/\/([\w-]+\.)+([\w]+\/)+(\w+\.\w+)?(\?[^#]+)?(#.*)*/;
			
			
			var arr =  pattern.exec(href);
			var param_str = arr[4].slice(1).split("&");
			var hash = arr[5].slice(3).split("/");
			var param = {};
			param_str.each(function(v){
				v = v.split("=");
				param[v[0]] = decodeURIComponent(v[1]);
			});
			
			return {
				source:href,
				param:param,
				hash:hash
			};
		},
		/**
		 * 设置hash部分，省去了感叹号
		 * @param {String} hash
		 * @returns {___anonymous40_1759}
		 */
		set:function(hash){
			window.location.hash = "!"+hash;
			return this;
		},
		/**
		 * 获取url详细信息||单独某一项的信息
		 * @param key
		 * @returns
		 * @example
		 * 	this.get();
		 * this.get('hash');
		 */
		get:function(key){
			if(!key){
				return this._get_url_detail();
			}
			
			return this.get()[key];
		},
		get_hash_value:function(key){
			var hash =this.get("hash");
			var index = hash.indexOf(key);
			return hash[index+1];
		},
		get_param_value:function(){
			
		},
		get_value:function(key){
			return this.get_hash_value(key)||this.get_param_value(key);
		},
		/**
		 * 设置hash路径
		 * 
		 * @param {Object}param -
		 * @example
		 * 	this.set_hash_value({id:11,name:22});
		 * #!/id/11/name/22
		 */
		set_hash_value:function(param){
			var str = "/";
			for(var key in param){
				str+=key+"/"+param[key]+"/";
			}
			this.set(str);
			return;
		},
		set_router_tables:function(tables){
			Utils.extend(this.tables,tables);
			return this;
		},
		_check_hash_change:function(){
			var hash = window.location.hash;
			if(this.history!==hash){
				this._do_onchanged();
			}
		},
		_do_onchanged:function(){
			var history = this.history;
			this.dispatchEvent("hashchange",{hash:window.location.hash,history:history});
			this.history = window.location.hash;
			this._do_check_tables();
			return this;
		},
		/**
		 * 路由表改变后处理方式。
		 */
		_do_check_tables:function(){
			var test_target = window.location.hash;
			
			for ( var rule in this.tables) {
				var pattern = new RegExp(rule);
				if(pattern.test(test_target)){
					var lambda = this.tables[rule];
					lambda();
					return;
				}
			}
		},
		run:function(){
			this._do_onchanged();
		}
	};
	for(var key in EventDispatcher){
		router[key] = EventDispatcher[key];
	}
	
	return router.initialize();
})();
