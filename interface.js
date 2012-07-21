var wbxtraceinterface = {
	
	load : function(path){},
	save : function (path) {},	// path might be null
	updateRowAttribs : function (row, object){},
	filter : function(filter) {}, // filter, like 'XXX OR YYY AND ZZZ'
	watch : function (start, count){},	// 'start' might be line num, -1 means 'head'; 'count' less than 0 means reverse.
	get : function(property){},	// property:['allFields', 'fields']
	set : function(property){},	// property:['fields']
};

var wbxtraceevent = {
	ondata : function(str){}, // str:"{row, attrib, [fields]}"
};