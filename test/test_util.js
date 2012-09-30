TestCase("test_utils",{
	setUp:function(){
		this.arr = [1,2,3,4,5];
	},
	'test_array_each':function(){
		assertTrue(typeof this.arr.each == 'function');
	},
	'test_array_each_fn':function(){
		var r ='';
		this.arr.each(function(v,i){
			r +=v;
		});
		assertEquals("12345",r);
	}
});