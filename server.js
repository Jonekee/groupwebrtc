var express=require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var uuid=require('shortid');
server.listen(8080);

var sockethash={};

app.use("/static",express.static(__dirname+"/static"));


app.get('/',function(req,res){
     res.redirect('/'+uuid.generate());
});

app.get('/:data',function(req,res){



if(!io.nsps['/'+req.params.data])
{
  sockethash[req.params.data]={};
  var nsp = io.of('/'+req.params.data);
  nsp.on('connection', function(socket){
     socket.on('sendID',function(data){
     	sockethash[req.params.data][data.id]=socket.id;
     	console.log(sockethash);
     	nsp.to(socket.id).emit('ack',null);
     });
     socket.on('getsockets',function(data){
     	nsp.emit('setsockets',sockethash[req.params.data]);
     });

    socket.on("emitice",function(data){
    	var tos=sockethash[req.params.data][data.toid];
    	nsp.to(tos).emit("sendice",data);
    });

    socket.on("emitoffer",function(data){
    	console.log("emitting offer");
    	var tos=sockethash[req.params.data][data.toid];
    	console.log(tos);
    	nsp.to(tos).emit("reciveoffer",data);
    });

    socket.on("emitanswer",function(data){
    	console.log("answer recived from "+data);
    	var tos=sockethash[req.params.data][data.toid];
    	console.log(tos);
    	nsp.to(tos).emit("reciveanswer",data);
    });




     socket.on('disconnect',function(){
     	for(var key in sockethash[req.params.data])
     	{
     		if(sockethash[req.params.data][key]===socket.id)
     		{
     			delete sockethash[req.params.data][key];
     			console.log("data deleted");
     			console.log(sockethash);
     		}
     	}
     });
  });
}
res.sendfile(__dirname+"/index.html");

});