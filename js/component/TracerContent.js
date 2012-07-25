
wbxTracer.TracerContent = {
	selectedRow : null,
	loadContent : function(path){
		console.info('loadContent');
		var self = this;
		var content = this._getContent();
		
		if(content.length == 0) {
			wbxTracer.mainTabs.attachTraceNode('No Data loaded!');
		} else {
			this._showTable(content);
			//this._showDiv(content);
			// var headAdded = false;
			// var table = $('<table></table>');
			// var start = new Date();
			// // var divC = $('<div class="container"></div>');
			// wbxTracer.mainTabs.attachTraceNode(table);
			// console.info("append time:"+(new Date() - start));
// 			
			// for(var i in content) {
				// var row = content[i];
				// if(!headAdded) {
					// this._appendHead(row, table);
					// headAdded = true;
				// }
				// for(var index = 0; index < 10000; index++){
					// this._appendRow(row, table);
				// }				
			// }
// 			
			// // wbxTracer.mainTabs.attachTraceNode(table);
			// console.info("append time2:"+(new Date() - start));
			// wbxTracer.mainTabs.attachTraceNode(divC);
			// $('div', $('.container')).click(function(e){
				// if(self.selectedRow != null){
					// self.selectedRow.removeClass('selectedrow');
				// }				
				// $(this).addClass('selectedrow');
				// self.selectedRow = $(this);
			// });
			// table.select(function(){
				// return false;
			// });
		}

		// var worker = new Worker('LoadContent.js');
		// worker.onmessage = function(event){
			// this.showContent();
		// }
		// worker.postMessage({path : path});
	},
	_getContent : function(){
		var data = [{lineNum : 1, tag : 'login', level : 'debug', time : '2012.03.21 10:30 AM',	content	: 'Login successfully!'},
					{lineNum : 2, tag : 'message', level : 'debug',	time : '2012.03.21 10:30 AM', content : 'Receive message Test'}];
		return data;
	},
	
	// fiterContent : function(condition){
	// 	var worker = new Worker('FilterContent.js');
	// 	worker.onmessage = function(event){
	// 		
	// 	}
	// 	worker.postMessage(condition);
	// },
	
	// showContent : function(content){
	// 	var row = {};
	// 	for(var i in content){
	// 		row = content[i];
	// 		this._appendRow(row);
	// 	}
	// },
	_showTable : function(content){		
		var headAdded = false;
		var table = $('<table></table>');
		var start = new Date();
		
		wbxTracer.mainTabs.attachTraceNode(table);
		console.info("append time:" + (new Date() - start));

		for(var i in content) {
			var row = content[i];
			if(!headAdded) {
				this._appendTableHead(row, table);
				headAdded = true;
			}
			for(var index = 0; index < 10; index++) {
				this._appendTableRow(row, table);
			}
		}

		// wbxTracer.mainTabs.attachTraceNode(table);
		console.info("append time2:" + (new Date() - start));
	},
	
	// _showDiv : function(content){		
	// 	var headAdded = false;
	// 	var divC = $('<div class="tracercontainer"></div>');
	// 	var start = new Date();
	// 	wbxTracer.mainTabs.attachTraceNode(divC);
	// 	console.info("append time:" + (new Date() - start));
	// 
	// 	for(var i in content) {
	// 		var row = content[i];
	// 		if(!headAdded) {
	// 			this._appendDivHead(row, divC);
	// 			headAdded = true;
	// 		}
	// 		for(var index = 0; index < 10000; index++) {
	// 			this._appendDivRow(row, divC);
	// 		}
	// 	}
	// 	// wbxTracer.mainTabs.attachTraceNode(table);
	// 	console.info("append time2:" + (new Date() - start));
	// },
	
	_appendTableHead : function(row, parent){
		var head = $('<tr class="tracerhead"></tr>');
		for (var item in row){
			head.append('<th>' + item.toUpperCase() + '</th>');			
		}
		parent.append(head);
	},
	
	_appendTableRow : function(row, parent){
		var rowStr = '<tr class="tracerrow">';
		for(var item in row){			
			rowStr += '<td class="rowitem">' + row[item] + '</td>';
		}		
		rowStr += '</tr>';
		parent.append(rowStr);
	},
	
	// _appendDivHead : function(row, parent){
	// 	var head = $('<div class="tracerhead"></div>');
	// 	for (var item in row){
	// 		head.append('<span class="headitem">' + item.toUpperCase() + '</span>');
	// 	}
	// 	parent.append(head);
	// },
	/**
	 * row = {rowNum, tagName, message}
	 */
	// _appendDivRow : function(row, parent){
	// 	var rowStr = '<div class="tracerrow">';
	// 	for(var item in row){
	// 		rowStr += '<span class="rowitem">' + row[item] + '</span>';
	// 	}
	// 	rowStr += '</div>';
	// 	parent.append(rowStr);
	// },
	
	updateRow : function(){
		
	},
	
	showDetailInfo : function(line){
		
	}
}
