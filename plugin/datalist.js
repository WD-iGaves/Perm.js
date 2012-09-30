/**
 * 列表类基础
 * @author d.wang;
 * @param {String} [props.selector.m] -选择器，列表的id或者其余能选中列表的
 * @param {String} [props.selector.items] -选择器，列表的node选择器
 * @param {Function} [props.initializer] -每一个节点的初始化函数
 * @example
 * var d = new DataList({
 * 	selector:{m:"#data-list",items:"selector"}
 * }):
 * d.set_initializer(function(dom,dom_data){
 * 	dom.html(dom_data);
 * });
 * d.set_data([1,2,3,4,5,6]);
 */
var DataList = Class.create({
	initialize:function(props){
		/**
		 * selector:{m,items,
		 */
		this.selector = {items:'j-data-list-item'};
		/**
		 * {Array} -数据列表
		 */
		this.data = [];
		/**
		 * {Array|Dom} -实际使用节点列表
		 */
		this.items = [];
		/**
		 * {Array||Dom} -所有节点列表
		 */
		this.all_items = [];
		this.initializer = function(){};
		/**
		 * {Dom} -主要的dom节点
		 */
		this.m = null;
		this._item_tpl = null; 
		Hash.create(props).each(function(v,k){
			if(k == 'selector'){
				Hash.create(v).each(function(sv,sk){
					this.selector[sk] = sv;
				},this);
				
				return;
			}
			this[k] = v;
		},this);
		this.prepare();
		
		this.__alias_event();
		
		this.__alias();
	},
	prepare:function(){
//		Hash.create(this.selector).each(function(value,key){
//			this[key] = new Dom(value);
//		},this);
		this.m = new Dom(this.selector.m);
		this.items = this.m.find(this.selector.items);
		
		this._item_tpl = this.items.clone();
		this.items.remove();
		
		this.items = [];
	},
	set_data:function(data){
		this.data = data.clone();
		var offset = this.all_items.length - this.data.length;
//		console.log(offset);
		while(offset>0){
			this._remove_item(this.all_items[this.all_items.length-offset]);
//			console.log(offset);
			offset--;
		}
		
		this.data.each(function(v,i){
			var item = this.all_items[i];
			if(typeof item == 'undefined'){
				item = this._add_item();
			}
//			item.data("data",v);
			this._initializer(item,v);
		},this);
		
		this._reset_items();
	},
	/**
	 * 每一个节点的操作函数，包括执行initializer;
	 * @param item
	 * @param value
	 * @returns
	 */
	_initializer:function(item,value){
		this.initializer(item,value);
		item.data("data",value);
		item.show();
		item.remove_attr("status");
		return item;
	},
	/**
	 * 添加
	 * @param item_data
	 */
	push:function(item_data){
//		this.data.push(item_data);
		var item = this.all_items[this.data.length];
		if(!item){
			item = this._add_item();
		}
		this.data.push(item_data);
		this._initializer(item, item_data);
//		item.data("data",data);
		this._reset_items();
		return this;
	},
	unshift:function(item_data){
		var item = this._insert_item(0);
		this.data.unshift(item_data);
		this._initializer(item, item_data);
		
		this._reset_items();
		return this;
	},
	remove_by_item_data:function(item_data){
		this.items.each(function(v,index){
			var data =  v.data("data");
			if(data == item_data){
				this.remove_by_index(index);
				throw 'break';
			}
		},this);
		return this;
	},
	/**
	 * 根据index删除某个节点
	 * @param index
	 */
	remove_by_index:function(index){
		this.data.splice(index,1);
		this.items[index].remove();
		this._reset_items();
		return this;
	},
	/**
	 * 冲设置all-teim and items;
	 */
	_reset_items:function(){
		this.all_items = this.m.find(this.selector.items).to_a();
		this.items = this.m.find(this.selector.items+"[status!=remove]").to_a();
//		console.log(this.selector.items+"[status!=remove]");
		return this;
	},
	/**
	 * 删除某个节点
	 * @param item
	 * @returns
	 */
	_remove_item:function(item){
		item.hide().attr("status",'remove');
//		console.log(item._d);
		return item;
	},
	/**
	 * 添加一个新节点。
	 * @returns
	 */
	_add_item:function(){
		var node = this._item_tpl.clone();
		node.append_to(this.m);
		return node;
	},
	_insert_item:function(index){
		index = index?index:0;
		var node = this._item_tpl.clone();
		if(this.items[index]){
			node.insert_before(this.items[index]);
		}else{
			return this._add_item();
		}
		return node;
	},
	/**
	 * 设置节点初始化
	 * @param fn
	 * @returns {___anonymous28_1459}
	 */
	set_initializer:function(fn){
		if(typeof fn == 'function'){
			this.initializer =fn;
		}
		return this;
	},
	__alias:function(){
		
	}
},EventDispatcher);