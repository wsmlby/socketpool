var Pool=require("stagepool").Pool;
var events = require("events");
function SocketPool(){
    this.Pool=new Pool({stages:["connecting","ready","occupied"]});
    this.buffers=[];
}
util.inherits(SocketPool, events.EventEmitter);
function initSocket(sp,socket){
    socket.on('data',function(data){
        sp.emit("data",socket,data,socket._stage);
    });
    socket.on('error',function(err){
        sp.Pool.remove(socket,socket._stage);
        sp.emit("error",socket,err);
    });
    socket.on('end',function(){
        sp.emit("end",socket);
    });
}   
SocketPool.prototype.add=function(socket){
    this.Pool.add(socket,"connecting");
    this.emit("beforeConnect",socket)
    initSocket(this,socket);
    
}
SocletPool.prototype.addReady=function(socket){
    this.Pool.add(socket,"ready");
    this.emit("ready",socket)
    initSocket(this,socket);
}
SocketPool.prototype.send=function(data){
    var s=getSocket(this);
    if(!s){
	this.buffers.unshift(data);
	return;
    }
    var sp=this;
    s.write(data,function(){
        sp.Pool.move(s,"occupied","start");    
    });
    
}
var getSocket=function(sp){
    var p=sp.Pool.popFrom("ready");
    if(p!=null)
	   sp.Pool.add(p,"occupied");
    return p;
}
