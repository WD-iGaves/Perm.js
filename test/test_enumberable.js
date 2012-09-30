TestCase("test_enumberable",{
	setUp:function(){
		var Person = Class.create({
			initialize:function(name,age){
				this.name = name;
				this.age = age;
				this.hash = {
						name:'wangdong',
						age:18,
						sex:1
					};
				this.array = [1,2,3,4,5];
			},
			get_name:function(){
				return this.name;
			},
			get_age:function(){
				return this.age;
			},
			_each:function(iterator,context){
				for (var key in this.hash) {
					iterator.call(context,key,this.hash[key]);
				}
			}
		});
		var Man = Class.create({
			initialize:function(name,age,sex){
				this._super("initialize",name,age);
				this.sex = sex;
			},
			get_sex:function(){
				return this.sex;
			},
			get_age:function(){
				return this._super("get_age")+":ye!";
			},
			get_message:function(){
				return 'age'+this.age+'sex:'+this.sex;
			},
			toString:function(){
				 var a = [];
				this.each(function(key,value){
					a.push(value);
				});
				return a;
			},
		},Person,Enumberable);
		
		this.man = new Man();
		this.person = new Person();
	},
	tearDown:function(){
		this.man=null;
		this.person=null;
	},
	'test_each':function(){
		var message = '';
		this.man.each(function(key,value){
			message+=key+""+value;
		});
		assertEquals('namewangdongage18sex1',message);
	},
	'test_inherit_each':function(){
		assertEquals('wangdong,18,1',this.man.toString());
	},
	'test_break':function(){
		var s = '';
		this.man.each(function(key,value){
			if(key == 'sex'){
				s = value;
				throw 'break';
			}
		});
		assertEquals(1,s);
	},
	'test_collect':function(){
		var r = this.man.map(function(key,value){
			return value+"!";
		});
		assertEquals(['wangdong!','18!','1!'],r);
	}
});