var Pool=require("stagepool").Pool;
var events = require("events");
function SocketPool(){
    events.EventEmitter.call(this);
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
        sp.emit("partlyend",socket);
    });
}   
SocketPool.prototype.add=function(socket){
    initSocket(this,socket);
    this.Pool.add(socket,"connecting");
    this.emit("beforeConnect",socket);
    
    
}
SocketPool.prototype.addReady=function(socket){
    initSocket(this,socket);
    this.Pool.add(socket,"ready");
    this.emit("ready",socket);
    
}
SocketPool.prototype.moveToReady=function(socket){
    this.Pool.move(socket,"connecting","ready");
    this.emit("ready",socket);
    //initSocket(this,socket);
}
SocketPool.prototype.isEmpty=function(){
    return this.Pool.size("ready")+this.Pool.size("occupied")==0;
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

exports.SocketPool=SocketPool;
