var _water_fall_property = {
	/**
	 * 
	 * @param config
	 * new UIWaterfall({
	 * 	m:dom,
	 * 	column_width:300,
	 * 	margin:20,
	 * 	padding:30
	*   initializer:function(item,data){
	*		//draw your render here
	*   }
	 * });
	 */
	initialize:function(config){
		/**
		 * 列数
		 */
		this.column=0;
		/**
		 * 开始位置
		 */
		this.start_x = 0;
		/**
		 * 列宽
		 */
		this.column_width=100;
		/**
		 * 添加后，初始化函数。
		 */
		this.initializer = Utils.k;
		/**
		 * 主容器
		 */
		this.m = document.body;
		/**
		 * 列宽
		 */
		this.column_width=100;
		/**
		 * 元素数据存列
		 */
		this.items = [];
		this.items_list = [];
		this.item_class = 'water-fall-item';
		/**
		 * 重复区域模板
		 */
		this.item_template = null;
		/**
		 * 两侧留白
		 */
		this.padding = 30;
		/**
		 * 间隔
		 */
		this.margin = 20;
		/**
		 * 在run之前是否清除模板内容
		 */
		this.cleanup = false;
		
		/**
		 * 页面高度
		 */
		this.height = 0;
//		Utils.extend(this,config);
		for(var key in config){
			this[key] = config[key];
		}
		
		this.__alias_event();
	},
	/**
	 * 初始化执行,将原有的块加载进缓存列表。
	 */
	_prepare:function(){
		//初始化列表
		var children = this.m.childNodes;
		for ( var i = 0; i < children.length; i++) {
			var child = children[i];
			var pattern = new RegExp(this.item_class);
			if(child.nodeType == 1 && pattern.test(child.className)){
				//创建模板
				if(!this.item_template){
					this.item_template = child.cloneNode(true);
				}
				if(!this.cleanup){
					this.items.push(child);
				}else{
					this.m.removeChild(child);
				}
			}
		}
		
		return this;
	},
	create_item:function(data){
		var item  = this.item_template.cloneNode(true);
		this.initializer(item,data);
		this.m.appendChild(item);
		this.set_item(item,this.items.length);
		return item;
	},
	set_initializer:function(fn){
		this.initializer = fn;
		return this;
	},
	reset:function(){
		var max = this.m.offsetWidth;
//		console.log(max);
		this.column = Math.floor((max+this.margin)/(this.column_width+this.margin));
//		console.log(this.column);
		this.items_list = [];
		for ( var i = 0; i < this.column; i++) {
			this.items_list[i] = [];
		}
		
		this.start_x = (max-this.column_width*this.column-this.margin*(this.column-1))/2;
	},
	resize:function(){
		this.reset();
		for ( var i = 0; i < this.items.length; i++) {
			var item = this.items[i];
			this.set_item(item,i);
		}
		
	},
	/**
	 * 设置一个item
	 * @param target
	 * @param offset
	 * @returns
	 */
	set_item:function(target,offset){
		var x=this.start_x,y=0;
		var top_list = [];
		var index = 0;
		/*if(offset<this.column){
			x = this.start_x+(this.column_width+this.margin)*offset;
		}else{
			for ( var i = offset-1; i > offset-this.column-1; i--) {
				var item = this.items[i];
				if(!item){
					continue;
				}else{
					var _y = parseInt(item.style.top)+item.offsetHeight+this.margin;
					if(!y){
						y = _y;
						index = i;
						
					}else{
						if(_y<y){
							y = _y;
							index = i;
						}
					}
					
					top_list.push(_y);
				}
			}
			
			x = this.start_x+(this.column_width+this.margin)*(index%this.column);
		}*/
		//调用调整块函数
		if(offset<this.column){
			index = offset;
		}else{
			for ( var i = 0; i < this.column; i++) {
				var item = this.items_list[i][this.items_list[i].length-1];
				var _y = parseInt(item.style.top)+item.offsetHeight+this.margin;
				top_list.push(_y);
				if(!y){
					y = _y;
					index = i;
					continue;
				}else{
					if(y>_y){
						y = _y;
						index = i;
					}
				}
			}
		}
		x = this.start_x+(this.column_width+this.margin)*index;
		//压入数组
		this.items_list[index].push(target);
		//设置变量
		this._resizer(target,{top:y,left:x});
		//调整盒子的高度
		this._set_height(parseInt(target.style.top)+target.offsetHeight+this.margin);
		
		return target;
	},
	/**
	 * 调整盒子高度
	 * @param item
	 * @param property
	 */
	_set_height:function(h){
		if(h>this.height){
			this.height = h;
			this.m.style.height = this.height+'px';
		}
	},
	_resizer:function(item,property){
		item.style.left = property.left+'px';
		item.style.top = property.top+'px';
	},
	scroll_down:function(event){
		var doc = document.documentElement,body = document.body;
		var ctop = doc.clientHeight + (doc.scrollTop||body.scrollTop);
		var stop = body.offsetHeight;
//		console.log(ctop,stop);
		if(ctop>=stop){
//			console.log(ctop,stop);
			this.scroll_down_handler.delay(500,this);
		}
	},
	scroll_down_handler:function(){
//		alert(1);
//		console.log('run');
		this.dispatchEvent("water-flow-end");
//		var body = document.body;
//		body.style.height = parseInt(body.style.height)+100+'px';
		
		return this;
	},
	add_data:function(data){
		for (var i = 0; i < data.length; i++) {
			var item = this.create_item(data[i]);
			this.items.push(item);
		};		
	},
	/**
	 * 初始化事件。
	 */
	_init_event:function(){
		this._bind_dom_event(window,'scroll',this.scroll_down.proxy(this));
		this._bind_dom_event(window,'resize',this.resize.proxy(this));
	},
	/**
	 * 简易bind,为了此类脱离任何选择器可复用。
	 * @param target
	 * @param event
	 * @param handler
	 */
	_bind_dom_event:function(target,event,handler){
		if(window.addEventListener){
			target.addEventListener(event,handler);
		}else{
			target.attachEvent('on'+event,handler);
		}
	},
	run:function(){
		this.dispatchEvent('water-fall-start');
		this._prepare();
		this._init_event();
		this.resize();
	}
};
var UIWaterFall = Class.create(_water_fall_property,EventDispatcher);
