var Hash = Class.create({
	initialize:function(object){
		this.object= object;
	},
	_each:function(iterator,context){
		for ( var key in this.object) {
			iterator.call(context,this.object[key],key);
		}
	},
	keys:function(){
		var keys = [];
		this.each(function(value,key){
			keys.push(key);
		});
		return keys;
	},
	values:function(){
		var values = [];
		this.each(function(value,key){
			values.push(value);
		});
		return values;
	},
	_has_key:function(key){
		var r = false;
		this.each(function(k){
			if(k == key){
				r = true;
				throw 'break';
			}
		});
		return r;
	},
	_has_value:function(value){
		var r = false;
		this.each(function(k,v){
			if(v == value){
				r = true;
				throw 'break';
			}
		});
		return r;
	},
	has_property:function(key){
		return this._has_key(key);
	},
	add:function(key,value){
		this.object[key] =value;
		return this;
	},
	key:function(){
		return this.object[key];
	},
	remove:function(key){
		delete this.object[key];
		return this;
	},
	/**
	 * 抓换成查询字符串。
	 * @returns
	 */
	to_query_string:function(){
		var q = [];
		this.each(function(v,k){
			q.push(k+'='+encodeURIComponent(v));
		});
		return q.join("&");
	}
},Enumberable);
Class.extend(Hash,{
	create:function(o){
		o = o||{};
		return new Hash(o);
	},
	each:function(object,fn,context){
		var h = new Hash(object);
		h.each(fn,context);
	}
});
//function H(o){
//	return new Hash(o);
//}
