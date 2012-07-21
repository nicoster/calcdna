//This is load WebTracer content js, used for Web Worker
self.onmessage = function(event){
	var path = event.data.path;
	console.log('path = ' + path);
	//TODO load content via plugin
	
	self.postMessage({successful : true});
}
