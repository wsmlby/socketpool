var Pool=require("stagepool").Pool;

function SocketPool(cbs){
    this.Pool=new Pool({stages:["connecting","ready","occupied"]});
    this.buffers=[];
    this.cbs=cbs;
}
SocketPool.prototype.add=function(socket){
    this.Pool.add(socket,"connecting");
}
SocletPool.prototype.addReady=function(socket){
    this.Pool.add(socket,"ready");
    this.cbs.onReady(this,socket);
}
SocketPool.prototype.send=function(data){
    var s=getSocket(this);
    if(!s){
	this.buffers.unshift(data);
	return;
    }
    s.write(data);
    this.Pool.move(s,"occupied","start");
}
var getSocket=function(sp){
    var p=sp.Pool.popFrom("ready");
    if(p!=null)
	sp.Pool.add(p,"occupied");
    return p;
}
