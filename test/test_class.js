TestCase("test_class",{
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
					iterator.call(context,key,value);
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

		var DateModule = {
			str2time:function(str){
				return new Date(str);
			}
		};
		var DataModule={
			time2str:function(a){
				return a.toString();
			}
		};
		var Monkey = Class.create({
			initialize:function(name,age){
				this._super("initialize",name,age);
			}
		},Person,DateModule);
		var Duck=Class.create({
			initialize:function(name,age){
			}
		},Person,DateModule,DataModule);
		
		this.person = new Person("wangdong",18);
		this.man = new Man("wangdong",18,1);
		this.monkey = new Monkey('wangdong',18); 
		this.duck=new Duck();
	},
	tearDown:function(){
		this.person=null;
		this.man=null;
		this.monkey = null;
	},
//	'test_instance':function(){
//		assertInstanceOf(Person,this.man);
//	},
	'test_person_age':function(){
		assertEquals(18,this.person.get_age());
	},
	'test_override':function(){
		assertEquals('18:ye!',this.man.get_age());
	},
	'test_mixin':function(){
		assertInstanceOf(Date,this.monkey.str2time('1231212313'));
	},
	'test_mixin_fn':function(){
		assertTypeOf('function',this.monkey.str2time);
	},
	'test_multi_mixin':function(){
		assertTypeOf("function",this.duck.time2str);
	}
});