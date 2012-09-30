/**
 * Event:
 * 	script_loaded
 * 	success
 * 	error
 * 	404
 * 	timeout
 */
var Xhr = Class.create({
	initialize:function(props){
		this.default_proxy = null;
		this.url = null;
		this.method = "GET";
		this.async = true;
		this.charset = "UTF-8";
		this.type = "TEXT";
		this._status404 = false;
		this.timeout=10000;
		this.timer = null;
		//拉去外部脚本
		this._script_id =null;
		
		//拉去外部css
		this._style_id=null;
		
			
		Utils.extend(this,props);
		
	},
	_request:function(){
		this._status404 = false;
		var r = this.get_xhr();
		r.open(this.method,this.url,this.async);
		
		r.onreadystatechange=function(){
			if(r.readState == 4){
				if(r.status == 200){
					var type_data = r.responseText;
					if(this.type == 'JSON'){
						type_data = eval("("+type_data+")");
					}else if(this.type == 'CSS'){
						this._set_css(type_data);
					}
					this.dispatchEvent('success',type_data);
					
					clearTimeout(this.timer);
				}else{
					if(r.status == 404){
						if(!this._status404){
							this._status404 =true;
							this.dispatchEvent('404',r);
							clearTimeout(this.timer);
						}
					}else{
						this.dispatchEvent('error',r);
						
						clearTimeout(this.timer);
					}
				}
			}
		}.proxy(this);
		
		//超时处理。
		this.timer = setTimeout(function(){
			this.dispatchEvent('timeout',r);
			r = null;
		}.proxy(this),this.timeout);
		//发送。
		if(method== "POST"){
			r.setRequestHeader("Content-type","application/x-www-form-urlencoded;charset="+this.charset);
			r.send(Hash.create(data).to_query_string());
		}else{
			r.send();
		}
	},
	get:function(url){
		this.url = url;
		this.method = 'get';
		this._request();
	},
	post:function(data){
		this.data = data;
		this.method = 'post';
		this._request();
	},
	load:function(url,method,data){
		this.url = url;
		this.data = data||{};
		this.method = method;
		this._request();
	},
	/**
	 * 拉去脚本
	 * @param refresh -是否允许重复拉去。
	 */
	get_script:function(url,refresh){
		this.url = url;
		//如果允许重复拉取，那么必须加随机数
		if(refresh){
			this.url+=this.url.indexOf("?")>-1?"&":"?";
			this.url+="_r"+Math.random();
		}
		
		var script = null;
		//判断是否拉过。
		if(this._script_id){
			if(!refresh){
				this.dispatchEvent("script_loaded");
				return;
			}else{
				script = document.getElementById(this._script_id);
				script.parentNode.removeChild(script);
			}
		}else{
			this._script_id = "script_"+Utils.random_string(8);
		}
		
		script = document.createElement('script');
		function _s(dom,key,value){
			dom.setAttribute(key,value);
		}
		
		_s(script,"type","text/javascript");
		_s(script,'src',this.url);
		_s(script,'id',this._script_id);
		
		if(navigator.userAgent.match(/msie/i)){
			script.onreadystatechange = function(){
				if(script.readyState == "complete" || script.readyState == "loaded"){
					this.dispatchEvent("script_loaded");
				}
			}.proxy(this);
		}else{
			script.onload = this.dispatchEvent.curry('script_loaded',this); 
		}
		
		document.getElementsByTagName('HEAD')[0].appendChild(script);
	},
	/**
	 * 创建css节点。
	 * @param e
	 */
	_set_css:function(e){
		var style = document.createElement('style');
		style.type = 'text/css';
		if (style.styleSheet){
			style.styleSheet.cssText = e;
		}else {
            var text = document.createTextNode(e);
            style.appendChild(text);
        }
		document.getElementsByTagName('HEAD')[0].appendChild(style);
	},
	/**
	 * xhr 来源函数，默认没有来源，不跨域
	 * @param fn
	 * @returns {___anonymous651_1195}
	 */
	set_xhr_getter:function(fn){
		this.default_proxy = fn;
		return this;
	},
	_default_xhr:function(){
		return Utils.try_these(
			function() {
				return new XMLHttpRequest();
			},
		    function() {
				return new ActiveXObject('Msxml2.XMLHTTP');
			},
			function() {
				return new ActiveXObject('Microsoft.XMLHTTP');
			}
		);
	},
	get_xhr:function(){
		if(typeof this.default_proxy=='function'){
			return this.default_proxy();
		}
		return this._default_xhr();
	}
},EventDispatcher);
