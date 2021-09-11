var webSocket;

function initWebSocket(){
    webSocket = new WebSocket(IP);
    webSocket.onmessage = function (event) {
        console.log(event.data);
        handlePacket(event);
    }
    webSocket.onopen = function(event) {
        console.log("Connection established");
        webSocket.send("Hello Server");
    }
}