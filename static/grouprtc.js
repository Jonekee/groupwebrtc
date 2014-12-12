
var socket=io.connect(window.location.pathname);


socket.on('connect',function(){
	console.log('socket got connected successfully');
});
socket.on('data',function(data){
	console.log(data);
});
socket.emit('hi','hi');
