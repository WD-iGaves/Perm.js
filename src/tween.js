/**
 *@param 
 */
var Tween = Class.create({
	initialize:function(startValues){
		this.duration=1000;
		this.startValues=startValues||{};
		this.endValues={};
		this.fn = Tween.Quad.easeInOut;
		this._delay = 0;
		this._chain = 0;
		//回调函数可以拿到当前的数据。
		this.currentValues = {};
		
		if(!Tween._is_start){
			Tween.start();
		}
		this.__alias_event();
	},
	delay:function(time){
		this._delay =  time;
		return this;
	},
	chain:function(tween){
		this._chain = tween;
		return this;
	},
	to:function(endValues,duration){
		this.endValues = endValues;
		this.duration=duration;

		for(var key in this.endValues){
			if(!this.startValues[key]) continue;
			this.currentValues[key] = this.startValues[key];
		}

		return this;
	},
	start:function(){
		this.index=Tween.index+'';
		Tween.index+=1;

		Tween.add(this);
		this.startTime= new Date().getTime();//Date.now();
		this.startTime+=this._delay;
//		this._doCallBack('start');
		this.dispatchEvent("start",this.startValues);
		return this;
	},
	update:function(){
		var time = new Date().getTime();//Date.now();
		if(time<this.startTime) return;
		var t = time-this.startTime,d=this.duration;
		if(t>this.duration) t= this.duration;
		for(var key in this.endValues){
			var c = this.endValues[key]-this.startValues[key];
			var b = this.startValues[key];
			var n = this.fn(t,b,c,d);
			this.currentValues[key] = n;
		}
//		this._doCallBack("update");
		this.dispatchEvent('update',this.currentValues);

		if(t >= this.duration){
			this.stop();

			if(this._chain){
				this._chain.start();
			}
		}
		return this;
	},
	stop:function(){
		Tween.remove(this);
//		this._doCallBack("end");
		this.dispatchEvent('end',this.endValues);
	}
},EventDispatcher);

Class.extend(Tween,{
	index:1,
	_tweens:{},
	_timer:null,
	_is_start:false,
	start:function(){
		if(!this._is_start){
			//基本上每秒30帧。多了无益。
//			this._timer = setInterval(this.update.proxy(),33);
			this._timer = setInterval(function(){
				Tween.update();
			},33);
			this._is_start = true;
		}
	},
	add:function(tween){
		this._tweens[tween.index.toString()] = tween;
	},
	remove:function(tween){
		var i = typeof tween == 'number'?tween:tween.index;
		delete this._tweens[i];
	},
	create:function(startValues){
		var t = new Tween.tween(startValues);
		return t;
	},
	update:function(){
		for(var key in this._tweens){
			var tween = this._tweens[key];

			if(tween){
				tween.update();
			}
		}
	},
	linear: function(t,b,c,d){ return c*t/d + b; },
	Quad:{
        easeIn: function(t,b,c,d){
            return c*(t/=d)*t + b;
        },
        easeOut: function(t,b,c,d){
            return -c *(t/=d)*(t-2) + b;
        },
        easeInOut: function(t,b,c,d){
            if ((t/=d/2) < 1) return c/2*t*t + b;
            return -c/2 * ((--t)*(t-2) - 1) + b;
        }
    }
});
