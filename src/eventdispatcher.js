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