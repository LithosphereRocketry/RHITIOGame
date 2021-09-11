const canvas = document.getElementById('gameview');
const ctx = canvas.getContext('2d');
const bufCnv = document.createElement('canvas');
bufCnv.width = X_RES;
bufCnv.height = Y_RES;
const bufCtx = bufCnv.getContext('2d');

// Clear the draw buffer 
function clearBuffer() {
    bufCtx.fillStyle = 'blue';
    bufCtx.fillRect(0, 0, X_RES, Y_RES);
}

// Push from buffer to live canvas
function push() {
    //bufCtx.drawImage(overlay, 0, 0, 1920, 1080);
    ctx.drawImage(bufCnv, 0, 0);
}

function renderLoop() {       
    clearBuffer();

    // Draw here
    //console.log(testImg);
    bufCtx.drawImage(testImg, x, y, 256, 256);

    push();
}

