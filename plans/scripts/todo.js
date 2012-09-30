//var TodoItem = Class.create({
//	initialize:function(){
//	}
//},Model);
var TodoService = Class.create({
	initialize:function(){
		this._local_key = 'todo-data';
		this.data = this.get_data();
	},
	get_data:function(server){
		this.data = this._get_data_from_storage()||{todo:[],done:[]};
		this.dispatchEvent("data_got",this.data);
	},
	save:function(){
		this._set_data_to_stroage(this.data);
	},
	_get_data_from_storage:function(){
		var data_str = localStorage[this._local_key];
		if(typeof data_str == 'string'){
			return eval("("+data_str+")");
		}else{
			return data_str;
		}
	},
	_set_data_to_stroage:function(data){
		localStorage[this._local_key] = JSON.stringify(data);
	},
	item_done_handler:function(e){
		this.data['todo'].remove_item(e.data);
		this.data['done'].push(e.data);
		
		this.save();
	},
	item_undone_handler:function(e){
//		console.log(e);
		this.item_add_handler(e);
		this.data.done.remove_item(e.data);
		this.save();
	},
	item_add_handler:function(e){
		this.data.todo.push(e.data);
		this.save();
	},
	item_delete_handler:function(e){
		this.data['todo'].remove_item(e.data);
		this.save();
	}
},Service);
var TodoView = Class.create({
	initialize:function(){
		//数据缓存；
		this.todo_data = null;
		this.done_data = null;
		
		this.current_item = null;
		//列表
		this.list = new DataList({
			selector:{
				m:"#to-do-list",
				items:"li"
			}
		});
		this.done_list = new DataList({
			selector:{
				m:"#to-do-done-list",
				items:"li"
			}
		});
		
		this.list.set_initializer(this.item_init_handler.proxy(this));
		this.done_list.set_initializer(this.item_init_handler.proxy(this));
		//长按定时器
		this._hold_timer=null;
		this._hold_time = 500;
		this._init_event();
	},
	_init_event:function(){
		this.m = $("#to-do-list-layout");
		this.todo_list = $("#to-do-list");
		this.editor = $("#to-do-editor");
		this.input = $("#todo-input");
		
//		var todo_delegate=[
//		    "li;click;show_ctrl_btn"
//		];
//		this._analysis_delegate(todo_delegate,this.todo_list);
		
		var editor_delegate=[
		    "[action];click;todo_action"                 
		];
		this._analysis_delegate(editor_delegate,this.m);
	},
	set_data:function(data){
		this.todo_data = data.todo;
		this.done_data = data.done;
		this.list.set_data(this.todo_data);
		this.done_list.set_data(this.done_data);
		
		return this;
	},
	item_init_handler:function(item,data){
		item.find("span").at(0).html(data.content);
	},
	//action处理调度
	todo_action_handler:function(e,target){
		var t = new Dom(target);
		var action = t.attr('action');
		target = new Dom(target);
		
		switch(action){
			case 'delete':
				this.delete_item_handler();
			break;
			case 'done':
				this.item_done_handler(target);
			break;
			case 'set':
				this.item_set_handler(target);
			break;
			case 'undone':
				this.item_undone_handler(target);
			break;
			case 'add':
				this.item_add_handler();
			break;
		}
	},
	delete_item_handler:function(){
		var data = this.current_item.data('data');
		this.dispatchEvent("item_delete",data);
		this.current_item.remove();
		this.current_item = null;
		this.editor.hide();
	},
	item_add_handler:function(){
		var value = this.input.val();
		var item_data = {content:value};
		this.dispatchEvent("item_add",item_data);
		this.list.push(item_data);
	},
	//完成
	item_done_handler:function(dom){
		this.current_item = dom.parent();
//		var id = this.current_item.attr('id').replace('todo-item-','');
		var data = this.current_item.data("data");
		this.dispatchEvent("item_done",data);
		this.list.remove_by_item_data(data);
		this.done_list.unshift(data);
//		console.log(data);
//		console.log(id);
	},
	item_undone_handler:function(dom){
		var undone_item = dom.parent();
		var item_data =undone_item.data("data");
		this.dispatchEvent("item_undone",item_data);
		this.done_list.remove_by_item_data(item_data);
		this.list.push(item_data);
	},
	//点击后，显示完成，设置，隐藏已有的设置窗口
	show_ctrl_btn_handler:function(e,target){
		target = new Dom(target);
		
		if(this.current_item){
			if(!this.current_item.equal(target)){
				this.current_item.remove_class("current");
			}else{
				return;
			}
		}
		this.current_item = target;
		this.current_item.add_class("current");
		this.editor.hide();
	},
	item_set_handler:function(dom){
		var current_item = this.current_item = dom.parent();
		var left = current_item.width(),top = current_item.offset_until('#to-do-list-layout').top;
		this.editor.css({left:left,top:top});
		this.editor.show();
	},
	/**
	 * 对外事件
	 */
	
	data_got_handler:function(e){
		this.set_data(e.data);
	}
},View);