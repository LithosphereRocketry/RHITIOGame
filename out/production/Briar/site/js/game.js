var x = 0;
var y = 0;

function tickLoop(){
    if(keys['w'.charCodeAt()]){
        webSocket.send("w");
    }
    if(keys['s'.charCodeAt()]){
        webSocket.send("s");
    }
    if(keys['d'.charCodeAt()]){
        webSocket.send("d");
    }
    if(keys['a'.charCodeAt()]){
        webSocket.send("a");
    }
}

function handlePacket(event){
    data = event.data.split(':');
    x = parseInt(data[0]);
    y = parseInt(data[1]);
}