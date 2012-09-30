/**
 * 选择器
 */
var Selector = (function(){
	/**
	 * @return {array}
	 */
	function find(selector,context){
		return to_a(Sizzle(selector,context));
//		return Sizzle(selector,context);
	};
	function filter(selector,context){
		return to_a(Sizzle.matches(selector,context));
//		return Sizzle.matches(selector,context);
	}
	function match(dom,selector){
		if('length' in dom){
			return Sizzle.matches(selector,dom);
		}else{
			return Sizzle.matchesSelector(dom,selector);
		}
	}
	function to_a(dom){
		var d = [];
		if('length' in dom && dom!=window){
			for ( var i = 0; i < dom.length; i++) {
				d.push(dom[i]);
			}
		}else{
			d.push(dom);
		}
		return d;
	}
	return{
		find:find,
		filter:filter,
		match:match,
		to_a:to_a
	};
})();

function $(d){
	return new Dom(d);
}

/**
 * dom属性
 */
var __dom_property = {
	initialize:function(element){
		if(typeof element == 'object'){
			if(typeof element.slice == 'function'){
				this._d = element;
			}else{
				this._d = Selector.to_a(element);
			}
		}else if(typeof element == 'string'){
			this._d = Selector.find(element);
		}else{
			throw 'illgal element';
		}
		
		if(!this._d){
			throw 'dom undefined';
		}
		
		this.token_name = '__data_token';
		this._historyStyleCache={};
		this.length = this._d.length;
		
		this._delegate = {};
		this.__alias();
		return Class.extend(this._d,this);
	},
	_EVENT_LIST:[
	     'click','mouseover','mouseout','mouseup','mousedown','dbclick','keydown','keypress','keyup','load','unload','abort','error','select',
	     'change','submit','reset','resize','scroll','focus','blur',
	     'orientationchange','touchstart','touchmove','touchend','touchcacel','gesturestart','gesturechange','gestureend'
	],
	_each:function(iterator,context){
		for ( var i = 0; i < this._d.length; i++) {
			iterator.call(context,this._d[i],i);
		}
	},
	/**
	 * 查找
	 * @param selector
	 * @returns {Dom}
	 */
	find:function(selector){
		var results = [];
		this._d.each(function(v,i){
			var r = Selector.find(selector,v);
			results = results.concat(results,r);
		});
		return new Dom(results);
	},
	val:function(value){
		if(!value){
			return this._d[0].value;
		}
		this.each(function(dom){
			dom.value = value;
		});
		return this;
	},
	/**
	 * 过滤
	 * @returns {Dom}
	 */
	filter:function(selector){
		return new Dom(Selector.filter(selector,this._d));
	},
	/**
	 * 获取/设置属性
	 * @param key{string}
	 * @param value{string}
	 * @returns {this|string}
	 */
	attr:function(key,value){
		if(typeof value == 'undefined'){
			return this._d[0].getAttribute(key);
		}else{
			this.each(function(v){
				v.setAttribute(key,value);
			});
			
			return this;
		}
	},
	remove_attr:function(key){
		this.each(function(v){
			v.removeAttribute("key");
		});
		return this;
	},
	/**
	 * 包裹父层
	 */
	parent:function(){
		return new Dom(this._d[0].parentNode);
	},
	/**
	 * 向上查找元素
	 * @param selector
	 * @returns
	 */
	parent_until:function(selector){
		var d =this._d[0].parentNode;
		while(!Selector.match(d,selector)){
			d = d.parentNode;
			if(!d){
				break;
			}
		}
		
		if(d){
			return new Dom(d);
		}
		return d;
	},
	/**
	 * @example
	 * 	var aa = new Dom('#wangdong .wangdong");
	 * aa.css({
	 * 	fontSize:12,
	 * 	color:'#00ff00'
	 * })
	 * @returns
	 */
	css:function(){
		var arg0 = arguments[0],arg1 = arguments[1],h=null;
		if(typeof arg0 == 'string'){
			if(typeof arg1 == 'undefined'){
				var d = this._d[0],returnValue=null;
				
				if (d.currentStyle){
					returnValue = d.currentStyle[arg0];
				}else if (window.getComputedStyle){
					returnValue = document.defaultView.getComputedStyle(d,null).getPropertyValue(arg0.replace(/([A-Z])/g,"-$1"));
				}
				return returnValue;
			}else{
				var props = {};
				props[arg0] = arg1;
				h = new Hash(props);
			}
		}
		if(typeof arg0 == 'object'){
			h = new Hash(arg0);
		}
		this.each(function(dom,index){
			h.each(function(value,key){
				if(/^\d.*\d$/.test(value)){
					value = value+"px";
				}
				dom.style[key] = value;
			});
		});
		
		return this;
	},
	css_pixel:function(attr){
		return parseInt(this.css(attr));
	},
	/**
	 * 显示
	 * @returns
	 */
	show:function(){
		return this._show_hide(true);
	},
	/**
	 * 隐藏
	 * @returns
	 */
	hide:function(){
		return this._show_hide();
	},
	/**
	 * 显示，隐藏基础
	 * @param show
	 * @returns {___anonymous818_4292}
	 */
	_show_hide:function(show){
		this.each(function(dom){
			var old = dom.getAttribute("_display");
			var d = new Dom(dom),current = d.css("display");
			if(!old){
				old = current;
				d.attr("_display",old);
			}
			if(show){
				if(old == 'none'){
					d.css('display','block');
				}else{
					d.css('display',old);
				}
			}else{
				d.css("display",'none');
			}
		});
		
		return this;
	},
	at:function(index){
		return new Dom(this._d[index]);
	},
	/**
	 * 向节点追加
	 * @param dom
	 */
	append:function(dom){
		if(dom instanceof Dom){
			dom = dom._d[0];
		}else if(typeof dom =='string'){
			if(/^<.*>$/.test(dom)){
				this.each(function(d){
					d.innerHTML +=dom;
				});
			}else{
				throw 'error';
			}
			return;
		}
		
		if(this.length == 1){
			this._d[0].appendChild(dom);
		}else{
			dom.removeAttribute("id");
			this.each(function(d,index){
				d.appendChild(dom.cloneNode(true));
			});
		}
		
		return this;
	},
	/**
	 * 
	 * @param dom{Dom|string} - 选择器，或者dom
	 * @param all
	 * @returns {___anonymous818_4970}
	 */
	append_to:function(dom){
		if(!(dom instanceof Dom)){
			dom == new Dom(dom);
		}
		dom.append(this);
		return this;
	},
	/**
	 * 前置插入
	 * @param dom
	 * @returns {___anonymous818_5844}
	 */
	insert_before:function(dom){
		var source = this._d[0],target = null;
		if(dom instanceof Dom){
			target = dom;
		}else{
			target  = new Dom(dom);
		}
		
		if(target.length == 1){
			target._d[0].parentNode.insertBefore(source,target._d[0]);
		}else{
			target.each(function(d){
				d.parentNode.insertBefore(source.cloneNode(true),d);
			});
		}
		
		return this;
	},
	/**
	 * 后置插入
	 * @param dom
	 */
	insert_after:function(dom){
		var source = this._d[0],target = null;
		if(dom instanceof Dom){
			target = dom;
		}else{
			target  = new Dom(dom);
		}
		if(target.length == 1){
			this._insertAfter(source,target._d[0]);
		}else{
			target.each(function(d){
				this._insert_after(source.cloneNode(true),d);
			},this);
		}
	},
	/**
	 * insert after实现
	 * @param source
	 * @param target
	 */
	_insert_after:function(source, target){
		var pnode = target.parentNode;
        if(pnode.lastChild == target){
        	pnode.appendChild(source);
        }else{
        	pnode.insertBefore(source,target.nextSibling);
        }
	},
	/**
	 * 自我节点删除。
	 */
	remove:function(){
		this.each(function(d,i){
			d.parentNode.removeChild(d);
		});
		return this;
	},
	/**
	 * 兄弟节点
	 * @returns {Dom}
	 */
	next_sibling:function(){
//		var node = this._d[0];
//		var next = node.nextSibling;
//		try{
//			while(next.nodeType!=1){
//				next = next.nextSibling;
//			}
//		}catch(e){
//			return null;
//		}
		var nexts = [];
		this.each(function(node){
			var next = node.nextSibling;
			try{
				while(next.nodeType!=1){
					next = next.nextSibling;
				}
			}catch(e){
				return null;
			}
			nexts.push(next);
		});
		return new Dom(nexts);
	},
	prev_sibling:function(){
		var prevs = [];
		this.each(function(node){
			var prev = node.previousSibling;
			try{
				while(prev.nodeType !=1){
					prev = prev.previousSibling;
				}
			}catch(e){
				return null;
			}
			prevs.push(prev);
		});
//		var node = this._d[0];
//		var prev = node.previousSibling;
//		try{
//			while(prev.nodeType!=1){
//				prev = prev.previousSibling;
//			}
//		}catch(e){
//			return null;
//		}
		return new Dom(prevs);
	},
	html:function(content){
		if(typeof content == 'undefined'){
			return this._d[0].innerHTML;
		}else{
			this.each(function(node){
				node.innerHTML = content;
			});
		}
		return this;
	},
	//demo
	delegate:function(selector,event,handler){
		var key = selector+event;
		var event_handler = function(e){
			e = e||window.event;
			var target = e.target||e.srcElement;
			this._event_delegate_handler(selector,event,target,e);
		};
		
		if(!this._delegate[key]){
			this._delegate[key] = [handler];
			this.addEventListener(event,event_handler.proxy(this));
		}else{
			if(this._delegate[key].has(handler)){
				return false;
			}else{
				this._delegate[key].push(handler);
			}
		}
		return this;
	},
	_event_delegate_handler:function(selector,e,target,event){
		var selected = this.find(selector);
		var key = selector+e;
		if(this._delegate[key].length == 0) return;
		
		if(!target) throw 'delegate un target';
		
		while(target && !this.has(target)){
//			console.log(selected.has(target),selected._d,target);
			if(selected.has(target)){
//				event.target = target;
//				console.log(target,event.target);
				this._delegate[key].each(function(fn){
//					console.log(event);
					fn(event,target);
				},this);
			}
			target = target.parentNode;
		}
	},
	undelegate:function(selector,event,handler){
//		this._delegate[key].
//		this._delegate[selector+event]
	},
	clone:function(){
		var node = this._d[0].cloneNode(true);
		node.removeAttribute("id");
		return new Dom(node);
	},
	has:function(dom){
		if(!dom) return false;
		
		if(dom instanceof Dom ||typeof dom.push == 'function'){
			dom = dom._d[0];
		}
		return this._d.has(dom);
	},
	//转化为数组
	to_a:function(){
		var doms = [];
		this.each(function(dom){
			doms.push(new Dom(dom));
		});
		return doms;
	},
	/**
	 * 取得高度或者宽度
	 * @param {Boolean}width -是否取得宽
	 * @returns
	 */
	_box_width_height:function(width){
		var d = this._d[0];
		var v = width?d.offsetWidth:d.offsetHeight;
		if(v == 0){
			var _d = new Dom(d);
			if(_d.css('display') == 'none'){
				_d.show();
				v =  width?d.offsetWidth:d.offsetHeight;
				_d.hide();
				_d = null;
			}
		}
		return v;
	},
	width:function(){
		return this._box_width_height(true);
	},
	height:function(){
		return this._box_width_height();
	},
	/**
	 * 取得对应document的高度
	 */
	offset:function(property){
		property = property.toLowerCase();
		var t = this._d[0].offsetTop,l=0;
		if(property == 'top'){
			return t;
		}else if(property == 'left'){
			l = this._d[0].offsetLeft;
			return l;
		}
		return {left:l,top:t};
	},
	offset_until:function(selecter){
		if(!selecter) selecter = 'body';
		var props = {left:0,right:0};
		var d =this._d[0];
		props.left = d.offsetLeft;
		props.top = d.offsetTop;
		d = d.parentNode;
		while(!Selector.match(d,selecter)){
			props.left += d.offsetLeft;
			props.top += d.offsetTop;
			
			d = d.parentNode;
			if(!d){
				break;
			}
		}
		
		return props;
	},
	add_class:function(cname){
		this.each(function(item){
			if(item.className.match(new RegExp('(\\s|^)'+cname+'(\\s|$)'))) return;
			var prefix = item.className?' ':'';
			item.className +=(prefix+cname);
		},this);
		
		return this;
	},
	remove_class:function(cname){
		this.each(function(item){
			item.className = item.className.replace(new RegExp('\\s*'+cname),'');
		},this);
		
		return this;
	},
	has_class:function(cname){
		var item = this._d[0];
		
		if (!item || !item.className) return false;
		return item.className.match(new RegExp('(\\s|^)'+cname+'(\\s|$)'));
	},
	/**
	 * 比较
	 * @param dom
	 * @returns {Boolean}
	 */
	equal:function(dom){
		if(dom instanceof Dom){
			if(this._d[0] == dom._d[0]){
				return true;
			}
		}
		return false;
	},
	data:function(key,value){
		var token = this._d[0][this.token_name];
		if(!token){
			token = "token"+Utils.random_string(8);
			this._d[0][this.token_name] = token;
			Dom.__data_cache[token] = {};
		}
		
		if(value){
			Dom.__data_cache[token][key] = value;
			return this;
		}
		if(!value){
			return Dom.__data_cache[token][key];
		}
	},
	__alias:function(){
		this.__alias_event();
		this.eq = this.at;
	}
};
var Dom = Class.create(__dom_property,Enumberable,EventDispatcher);
//ready事件。
Class.extend(Dom,{
	isReady:false,
	_readyCalls:[],
	_inited:false,
	/**
	 * dom.data方法
	 */
	__data_cache:{},
	ready:function(callback){
		if(!this._inited){
			this._initEvent();
		}
		
		if(this.isReady){
			callback();
			return;
		}else{
			this._readyCalls.push(callback);
		}
	},
	_initEvent:function(){
		this._inited=true;
		if (document.readyState === "complete" ) {
			this._doReady();
			return;
		}else if(!!window.addEventListener){
			document.addEventListener("DOMContentLoaded",function(){
				Dom.isReady = true;
				document.removeEventListener("DOMContentLoaded",arguments.callee,false);
				Dom._doReady();
			},false);
			return;
		}
		(function(){
			if(Dom.isReady) return;
			try {
				document.documentElement.doScroll('left');
			}catch(e){
				setTimeout(arguments.callee,16);
				return;
			}
			Dom._doReady();
		})();
	},
	_doReady:function(){
		for ( var i = 0; i < this._readyCalls.length; i++) {
			var lambda  = this._readyCalls[i];
			lambda();
		}
	},
	/**
	 * 创建
	 * @param nodeName
	 * @returns {Dom}
	 * @desc 如果参数为html文本。。返回的是个fragment,进行其他会报错。。暂时没啥好办法可以parseHTML进行操作。。
	 */
	create:function(nodeName){
		if(typeof nodeName == 'string'){
			if(nodeName.charAt(0) == '<' && nodeName.charAt(nodeName.length-1) == '>'){
				var d = document.createDocumentFragment();
				var t = document.createElement('div');
				t.innerHTML = nodeName;
				var children = Selector.to_a(t.childNodes);
				children.each(function(node){
					d.appendChild(node);
				});
				return new Dom(d);
			}else{
				return new Dom(document.create(nodeName));
			}
		}
	}
});
