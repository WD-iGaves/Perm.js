TestCase("test_dom_selector",{
	setUp:function(){
		/*:DOC +=
		 <div>
		 	<style>
		 		.wangdong{background-color:#ff00ff;height:92px;}
		 	</style>
			 <div id="wangdong">
			 	 <div class="wangdong"></div>
				 <div class="wangdong"></div>
				 <div class="wangdong" id="span-outer"><span id="wd-inner" class="wd-inner" style=""></span></div>
				 <div class="wangdong show"></div>
			 </div>
			 <div class="wangdong"></div>
		 </div>
		*/
	},
	'test_selector_id':function(){
		var d = $('#wangdong');
		assertTrue(d instanceof Dom);
	},
	'test_dom_setup':function(){
		assertEquals('wangdong',document.getElementById('wangdong').id);
	},
	'test_dom_selector':function(){
		var d = $("#wangdong");
		assertEquals('wangdong',d._d[0].id);
	},
	'test_dom_find':function(){
		var d = $("#wangdong");
		assertEquals(4,d.find('.wangdong').length);
	},
	'test_selector_find':function(){
		var context = Selector.find("#wangdong");
		assertEquals(document.getElementById("wangdong"),context[0]);
	},
	'test_selector_find_context':function(){
		var context = document.getElementById("wangdong");
		assertEquals(4,Selector.find('.wangdong',context).length);
	},
	'test_selector_find_instance':function(){
		assertInstanceOf(Array,Selector.find(".wangdong"));
	},
	'test_selector_filter':function(){
		var d = $("#wangdong");
		assertEquals(1,d.find('.wangdong').filter(".show").length);
	},
	'test_dom_attr_set':function(){
		$("#wangdong").attr('wangdong','111aaa');
		assertEquals('111aaa',$("#wangdong").attr('wangdong'));
	},
	'test_dom_parent':function(){
		assertEquals($("#span-outer"),$(".wd-inner").parent());
	},
	'test_dom_parent_util':function(){
		assertEquals($("#wangdong"),$(".wd-inner").parent_util("#wangdong"));
	},
//	'test_dom_css_get':function(){
//		assertEquals("92px",$(".wangdong").css("height"));
//	},
//	'test_dom_css_set':function(){
//		
//	}
	'test_dom_hide':function(){
		assertEquals('none',$(".wangdong").hide().css("display"));
	},
	'test_dom_show':function(){
		assertEquals('block',$("#span-outer").show().css("display"));
	},
	'test_dom_show_inner':function(){
		assertEquals('inline',$("#wd-inner").show().css("display"));
	},
	'test_dom_show_inner':function(){
		assertEquals('inline',$("#wd-inner").show().attr("_display"));
	}
});
