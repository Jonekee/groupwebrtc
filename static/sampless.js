
var connection=new RTCPeerConnection(window.iceServers,optionalRtpDataChannels);
function ErrorHandler(error)
    {
        console.log(error);
    }

connection.onicecandidate=function(event)
{
	if(!event || !event.candidate)return;
	socket.emit("emitice",{fromid:myid,toid:target,data:event.candidate});
}


socket.on('sendice',function(data){
	console.log("reciving the ice candidate");
	connection.addIceCandidate(new RTCIceCandidate(data.data));
});

// /*
//   CREATING DATACHANNEL
// */

var channel=connection.createDataChannel('atcchannel',{});

channel.onmessage=function(event)
{
	console.log(event.data);
}
channel.onopen=function()
{
	channel.send("hello");
}
channel.onerror=function(e){
	console.log(e);
}

channel.onclose=function(e){
	console.log(e);
}

function CreateOffer()
{
   console.log("creating the offer to pass to peer");
   connection.createOffer(function(offer){
   	  connection.setLocalDescription(offer);
   	  console.log("emitting offer");
   	    for(var i in friendids)
        { 
		socket.emit("emitoffer",{from:myid,toid:friendids[i],data:offer});
     	}
   },ErrorHandler,mediaConstraints)
   
}

socket.on("reciveoffer",function(data){
	target=data.from;
	connection.setRemoteDescription(new RTCSessionDescription(data.data),function(){
		connection.createAnswer(function(answer){
			connection.setLocalDescription(answer);
			console.log("sending answer");
			socket.emit("emitanswer",{from:myid,toid:target,data:answer});
		},ErrorHandler,mediaConstraints);
	});
});


socket.on("reciveanswer",function(data){
	console.log("answer recived");
	target=data.from;
	connection.setRemoteDescription(new RTCSessionDescription(data.data));
});


function PeerConnect(userid)
{
	self.connection=new RTCPeerConnection(window.iceServers,optionalRtpDataChannels);
	self.targetid=userid;
	self.myid=myid;
	function ErrorHandler(error)
    {
        console.log(error);
    }
	self.connection.onicecandidate=function(event)
	{
		if(!event || !event.candidate)return;
	    console.log("emitting ice candidate for userid "+self.targetid);
	    socket.emit("emitice",{from:self.myid,toid:self.targetid,data:event.candidate});
	}
	socket.on("sendice",function(data){
		console.log("reciving the ice candidates");
		self.connection.addIceCandidate(new RTCIceCandidate(data.data));
	});

	self.createOffer=function()
	{
		self.connection.createOffer(function(offer){
			self.connection.setLocalDescription(offer);
			socket.emit("emitoffer",{from:self.myid,toid:self.targetid,data:offer});
		},ErrorHandler,mediaConstraints);
	}

	socket.on("reciveoffer",function(data){
		self.connection.setRemoteDescription(new RTCSessionDescription(data.data),function(){
			self.connection.createAnswer(function(answer){
				self.connection.setLocalDescription(answer);
				socket.emit("emitanswer",{from:self.myid,toid:self.targetid,data:answer});
			});
		});
	});
	
}