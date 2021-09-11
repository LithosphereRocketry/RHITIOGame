var keys = [];
for(var i = 0; i < 256; i++) { keys[i] = false; }
window.addEventListener('keydown', keyDownHandler, true);
window.addEventListener('keyup', keyUpHandler, true);
function keyUpHandler(k) {
    
	keys[k.key.charCodeAt()] = false;
}
function keyDownHandler(k) {
    keys[k.key.charCodeAt()] = true
}


window.addEventListener('keydown', keyHandler, true);
function keyHandler(e) {
    //webSocket.send(e.key);
}