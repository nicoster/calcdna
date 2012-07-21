//build main frame and load other ui components

(function(){
	wbxTracer = {};
	
	templateString = 	'<div id="main">'+
							'<ul>'+
								'<li><a href="#traceContent">default</a></li>'+
							'</ul>'+
							'<div id="traceContent">'+
								// '<p>Proin elit Phasellus ipsum. Nunc tristique tempus lectus.</p>'+
							'</div>'+
						'</div>';
	
	jQuery.ajaxSettings.async = false;
	
	var modules = [];
	//load module list
	jQuery.getJSON("js/modules.js", function(data){
		modules = data;
	});	
		
    for (var i = 0, l = modules.length; i < l; i++) {
        jQuery.getScript(modules[i]);
    }
    
    $('.mainpage').append(templateString);
        
	wbxTracer.mainTabs.init($("#main"));
	
	//for test
	// wbxTracer.mainTabs.attachTraceNode("<span>test node</span>");
	wbxTracer.TracerContent.loadContent();
})();

 
