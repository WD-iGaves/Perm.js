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
	var __props = RegExp.prototype;
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
