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

function Initialize()
{
	for(var key in friendids)
	{
		ConnectObject[friendids[key]]=new RTCPeerConnection(window.iceServers,optionalRtpDataChannels);
		ChannelObject[friendids[key]]=ConnectObject[friendids[key]].createDataChannel('rtcchannel');
		ChannelObject[friendids[key]].onmessage=function(event)
		{
			console.log(event.data);
		}
		ChannelObject[friendids[key]].onopen=function()
		{
			channel.send("hello");
		}
		ChannelObject[friendids[key]].onerror=function(e){
			console.log(e);
		}

		ChannelObject[friendids[key]].onclose=function(e){
			console.log(e);
		}
	}
}


socket.on("sendice",function(data){
	var key=data.from;
	//console.log(new RTCIceCandidate(data.data));
	ConnectObject[key].addIceCandidate(new RTCIceCandidate(data.data));
});

socket.on("reciveoffer",function(data){
	var key=data.from;
	console.log("recivng offer from "+key);
	var obj=ConnectObject[key];
	obj.setRemoteDescription(new RTCSessionDescription(data.data),function(){
			obj.createAnswer(function(answer){
			    obj.setLocalDescription(answer);
			    socket.emit("emitanswer",{from:myid,toid:key,data:data});
			});
	});
});

socket.on("reciveanswer",function(data){
	var key=data.from;
	console.log("recivng answer from "+key);
	var obj=ConnectObject[key];
	obj.setRemoteDescription(new RTCSessionDescription(data.data));
});
function Connect(userid)
{
  console.log(ConnectObject);
  var connection = ConnectObject[userid];
  connection.onicecandidate=function(event)
  {
   if(!event || !event.candidate) return;
   socket.emit("emitice",{from:myid,toid:userid,data:event.candidate});
  };
  connection.createOffer(function(offer){
  	connection.setLocalDescription(offer);
  	socket.emit("emitoffer",{from:myid,toid:userid,data:offer});
  },ErrorHandler,mediaConstraints);

}



