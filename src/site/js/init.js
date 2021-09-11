main();

function main(){
    console.log("Game loaded!");                    // Remove in final build
    
    initWebSocket();
    
    setInterval(tickLoop, 1000 / TICK_RATE);

    setInterval(renderLoop, 1000 / FRAME_RATE);
}