 var mediaConstraints = {
					optional: [],
					mandatory: {
						OfferToReceiveAudio: true,
						OfferToReceiveVideo: true
					}
				};
				var optionalRtpDataChannels = {
				    optional: [{
				        RtpDataChannels: true
				    }]
				};
           
                window.RTCPeerConnection = window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
                window.RTCSessionDescription = window.mozRTCSessionDescription || window.RTCSessionDescription;
                window.RTCIceCandidate = window.mozRTCIceCandidate || window.RTCIceCandidate;

                navigator.getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia;
                window.URL = window.webkitURL || window.URL;

                window.iceServers = {
                    iceServers: [
                        {url: 'stun:23.21.150.121'},
                        {url: "stun:stun.l.google.com:19302"},
                        {url: "stun:stun.sipgate.net"},
                        {url: "stun:217.10.68.152"},
                        {url: "stun:stun.sipgate.net:10000"},
                        {url: "stun:217.10.68.152:10000"}
                    ]
                };
                 var video_constraints = {
                    mandatory: {},
                    optional: []
                };

                function getUserMedia(callback) {
                    var n = navigator;
                    n.getMedia = n.webkitGetUserMedia || n.mozGetUserMedia;
                    n.getMedia({
                        audio: true,
                        video: video_constraints
                    }, callback, onerror);

                    function onerror(e) {
						alert(JSON.stringify(e, null, '\t'));
                    }
                }


var target;

var socket=io.connect(window.location.pathname);

var myid=new Date().getTime();
var data={id:myid};

function ErrorHandler(error)
{
    console.log(error);
}

var friendids=[];

socket.emit("sendID",data);

socket.on("ack",function(data){
    socket.emit("getsockets",null);
});

socket.on("setsockets",function(data){
	//console.log(data);
	friendids=[];
	for(var key in data)
	{
	  console.log("comparing "+key +" with "+myid);
	   if(key!==myid.toString())
	   {
	   	friendids.push(key);
	   }
	   else
	   {
	   	console.log("found my key");
	   }
	}
});

var ConnectObject={};
var ChannelObject={};
var Connected={};

function Connect(userid)
{
   var connection=new RTCPeerConnection(window.iceServers,optionalRtpDataChannels);
   var channel=connection.createDataChannel("data");

   channel.onmessage=function(event){console.log(event.data);};
   channel.onopen=function(){console.log("channel has been opened for "+userid);};
   channel.onerror=function(error){console.log(error);};
   channel.onclose=function(error){console.log(error);};

   ConnectObject[userid]=connection;
   ChannelObject[userid]=channel;

   connection.onsignalingstatechange=function(e){
   	console.log("state Changed");
   }

   connection.createOffer(function(offer){
   	   connection.setLocalDescription(offer);
   	   socket.emit("emitoffer",{from:myid,toid:userid,data:offer});
   },ErrorHandler,mediaConstraints);

   connection.onicecandidate=function(event)
   {
   	if(!event || !event.candidate)return;
   	console.log("sending ice candidate");
   	socket.emit("emitice",{from:myid,toid:userid,data:event.candidate});
   }
}

socket.on("sendice",function(data){
	console.log("got ice candidate");
	ConnectObject[data.from].addIceCandidate(new RTCIceCandidate(data.data));
});

socket.on("reciveoffer",function(data){
	console.log("recive offer");
	var connection=new RTCPeerConnection(window.iceServers,optionalRtpDataChannels);
	var channel=connection.createDataChannel("data");
	 connection.onicecandidate=function(event)
   {
   	if(!event || !event.candidate)return;
   	console.log("sending ice candidate");
   	socket.emit("emitice",{from:myid,toid:data.from,data:event.candidate});
   }
    channel.onmessage=function(event){console.log(event.data);};
    channel.onopen=function(){console.log("channel has been opened for "+data.from);
     channel.send("hi");
     };
    channel.onerror=function(error){console.log(error);};
    channel.onclose=function(error){console.log("channel closed");};
     ConnectObject[data.from]=connection;
     ChannelObject[data.from]=channel;
    connection.setRemoteDescription(new RTCSessionDescription(data.data),function(){
    	connection.createAnswer(function(answer){
    	connection.setLocalDescription(answer);
    	socket.emit("emitanswer",{from:myid,toid:data.from,data:answer});
    },ErrorHandler,mediaConstraints);
    });
    
});

socket.on("reciveanswer",function(data){
	console.log("reciving answer");
	ConnectObject[data.from].setRemoteDescription(new RTCSessionDescription(data.data));
});



