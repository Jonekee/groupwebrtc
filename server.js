var express=require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var uuid=require('shortid');
server.listen(8080);


app.use("/static",express.static(__dirname+"/static"));


app.get('/',function(req,res){
     res.redirect('/'+uuid.generate());
});

app.get('/:data',function(req,res){
	
if(!io.nsps['/'+req.params.data])
{
  var nsp = io.of('/'+req.params.data);
  nsp.on('connection', function(socket){
     
    });
}
res.sendfile(__dirname+"/index.html");

});