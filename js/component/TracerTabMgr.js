//build tracer tabs

wbxTracer.mainTabs = {
	
	tabHomeNode : null,
	traceNode : null,
	currentTabIdx : 0,
	keyToIdxMap : {},
	idxToKeyMap : {},
	index : 0,
	
	
	init : function(tabHomeNode){
		if(this.tabNode != null){
			return;
		}
		this.tabHomeNode = tabHomeNode.tabs({
			 
 			add: function(event, ui ) {
			},
			
			select: function(event, ui ) {
 				wbxTracer.mainTabs.currentTabIdx = ui.index;
 				//append trace node to selected tab content
 				//using the same node to show different trace
 				$(ui.panel).append(wbxTracer.mainTabs.traceNode);
			}
		});
	},
	
	attachTraceNode : function(/*DOM*/node, callback){
		$("#traceContent", this.tabHomeNode).append(node);
		this.traceNode = node;
	},
	
	addTab : function(){
		
	},
	
	_addTab : function(/*content key*/key, title, isSelected) {
		//add a trace tab in the end
		this.tabHomeNode.tabs( "add", "#traceContent" + this.index++ , title );
		
		var addedTabIdx = this.tabHomeNode.tabs("length") - 1;
		this.keyToIdxMap[addedTabIdx] = key;
		this.idxToKeyMap[key] = addedTabIdx;
		
		if(isSelected == true){
			this._selectTracerTab(key, addedTabIdx);
		}
	},
	
	_removeTab : function(key){
		this.tabHomeNode.tabs("remove", index);
	},
	
	

	_selectTracerTab : function(key, index){
		this.tabHomeNode.tabs("select", index);
		
		//TODO show select trace content
		
	}
	
}
