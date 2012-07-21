wbxTracer.tracerDataService = {
	
	listeners : [],
	
	initService : function(){
		this._loadPlugin();
		this._loadData();
	},
	
	_loadPlugin : function(){
		
	},
	
	_loadData : function(){
		
	},
	
	callData : function(){
		
	},
	
	addDataChangeListener : function(listener){
		if(this.listeners.indexof(listener) == -1){
			this.listeners.push(listener);
		}
	},
	
	_onData : function(data){
		for(i in this.listeners){
			i(data);
		}
	}
}
