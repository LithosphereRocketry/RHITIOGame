var div = document.getElementById('canvasDiv');
function onLaunchClick(){
    if (navigator.userAgent.search("Chrome") >= 0) {
        //alert("Browser is Chrome");
        div.requestFullscreen();
    }
    //Check if browser is Firefox or not
    else if (navigator.userAgent.search("Firefox") >= 0) {
        //div.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        div.mozRequestFullScreen();
        //alert("Browser is FireFox");
    }
    //Check if browser is Safari or not
    else if (navigator.userAgent.search("Safari") >= 0 && navigator.userAgent.search("Chrome") < 0) {
        alert("Browser is Safari");
        div.requestFullscreen();
    }
    //Check if browser is Opera or not
    else if (navigator.userAgent.search("Opera") >= 0) {
        alert("Browser is Opera");
        div.requestFullscreen();
    } 
}