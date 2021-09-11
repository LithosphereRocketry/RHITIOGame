/*
    File: game.js
    Authors: Bagofmandms, Ryzerth
    Date: 05/01/2019
*/

class GraphicTerminal {
    constructor(ctx, x, y, w, h, col, row) {
        this.ctx = ctx;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.col = col;
        this.row = row;
        this.lines = makeArray(col, row, ' ');
        this.cursor = 'blink';

        this.cursorX = 0;
        this.cursorY = 0;

        // Rendering values
        this.cWidth = 10;
        this.cHeight = 15;
        this.curState = true;

        this.workedId = setInterval(() => {
            this._updateCursor();
        }, 500);
    }

    setCursorStyle(style) {
        this.cursor = style;
        this._updateCursor();
    }

    render() {
        this.ctx.font = '15px monospace';
        this.ctx.fillStyle = '#1E1E1E'
        this.ctx.fillRect(this.x, this.y, this.w, this.h);
        this.ctx.fillStyle = '#00FF00';
        this.ctx.textAlign = 'start';
        this.ctx.textBaseline = 'hanging';
        for (let yy = 0; yy < this.row; yy++) {
            for (let xx = 0; xx < this.col; xx++) {
                this.ctx.fillText(this.lines[yy][xx], this.x + (xx * this.cWidth), this.y + (yy * this.cHeight));
            }
        }
        if (this.curState) {
            if (this.cursorX >= this.col) {
                this.newLine();
            }
            this.ctx.fillRect(this.x + (this.cursorX * this.cWidth), this.y + (this.cursorY * this.cHeight), this.cWidth, this.cHeight);
        }
    }

    setCursorPos(x, y) {
        this.cursorX = x;
        this.cursorY = y;
    }

    _updateCursor() {
        if (this.cursor == 'blink') {
            this.curState = !this.curState;
        }
        if (this.cursor == 'off') {
            this.curState = false;
        }
        if (this.cursor == 'on') {
            this.curState = true;
        }
    }

    putcar(c, x, y) {
        this.lines[y][x] = c;
    }

    print(str) {
        for (let i = 0; i < str.length; i++) {
            if (this.cursorX >= this.col) {
                this.newLine();
            }if (str[i] != '\n') {
                this.lines[this.cursorY][this.cursorX] = str[i];
                this.cursorX++;
            }else {
                this.newLine();
            }
        }
        this.render();
    }

    println(str) {
        this.print(str + '\n');
    }

    scrollUp() {
        for (let i = 0; i < this.row - 1; i++) {
            this.lines[i] = this.lines[i + 1];
        }
        this.lines[this.row - 1] = new Array(this.col);
        for (let i = 0; i < this.col; i++) {
            this.lines[this.row - 1][i] = ' ';
        }
    }

    newLine() {
        this.cursorX = 0;
        this.cursorY++;
        if (this.cursorY >= this.row) {
            this.scrollUp();
            this.cursorY = this.row - 1;
        }
        this.render();
    }

    clearLine(n) {
        for (let i = 0; i < this.col; i++) {
            this.lines[n][i] = ' ';
        }
    }

    readLine() {
        let initX = this.cursorX;
        let initY = this.cursorY;
    }
}

// Stores a level map + draws it
class tilemap{
    constructor(x, y){
        this.x = x;
        this.y = y;
        this.map = makeArray(y, x, -1);
    }
    putTile(x, y, val){
        this.map[x][y] = val;
    }
    getTile(x, y){
        return this.map[x][y];
    }
    getMap(){
        return this.map;
    }
    putMap(map){
        this.map = map;
    }
    draw(x, y){
        for(var xi = 0; xi < this.x; xi++){
            for(var yi = 0; yi < this.y; yi++){
                drawTexture(6, xi*64+x, yi*64+y);
                if(this.map[xi][yi] != -1){
                    drawTexture(this.map[xi][yi], xi*64+x, yi*64+y);
                }
            }
        }
    }
}

class robot{
    constructor(map){
        this.map = map;
        this.x = 0;
        this.y = 0;
        this.facing;
        this.angle = 0;
    }
    setPos(x, y){
        this.x = x;
        this.y = y;
    }
    face(dir){
        this.facing = dir;
        switch(this.facing){
            case "U":
                this.angle = 3;
            break;
            case "D":
                this.angle = 1;
            break;
            case "L":
                this.angle = 2;
            break;
            case "R":
                this.angle = 0;
            break;
        }
    }
    step(){
        switch(this.facing){
            case "U":
                this.up();
            break;
            case "D":
                this.down();
            break;
            case "L":
                this.left();
            break;
            case "R":
                this.right();
            break;
        }
    }
    left(){
        if(this.x > 0 && this.map.getTile(this.x - 1, this.y) != 0){
            this.x--;
        }
    }
    right(){
        if(this.x < 15 && this.map.getTile(this.x + 1, this.y) != 0){
            this.x++;
        }
    }
    up(){
        if(this.y > 0 && this.map.getTile(this.x, this.y - 1) != 0){
            this.y--;
        }
    }
    down(){
        if(this.y < 11 && this.map.getTile(this.x, this.y + 1) != 0){
            this.y++;
        }
    }
    draw(rx, ry){
        bufCtx.save();
        bufCtx.translate(this.x*64+rx+32, this.y*64+ry+32);
        bufCtx.rotate((Math.PI/2)*this.angle);
        bufCtx.translate(-(this.x*64+rx+32), -(this.y*64+ry+32));
        drawTexture(2, this.x*64+rx, this.y*64+ry);
        bufCtx.restore();
    }
}

// Handles function of console window; commands, file manipulation, pushing code to game object to be parsed, etc.
class osObj{
    constructor(){
        this.files = [];
        this.active = -1;   // -1 indicates log. any other number denotes a specific program file.
        this.log = new GraphicTerminal(bufCtx, 1137, 75, 720, 480, 72, 32);
        this.consoleListener = new ConsoleListener(this.log);
    }

    input(key){
        if(this.active == -1){
            this.consoleListener.keyHandle(key);
        }else if(this.active == -2){
            if(key == "Escape"){
                running = false;
                this.active = -1;
                this.console.println("Program Cancelled.");
            }
        }else{
            this.files[this.active].keyHandle(key);
        }
    }

    render(){
        bufCtx.font = '15px monospace';
        bufCtx.fillStyle = '#1E1E1E'
        bufCtx.fillRect(1137, 75, 720, 480);
        bufCtx.fillStyle = '#00FF00';
        bufCtx.textAlign = 'start';
        bufCtx.textBaseline = 'hanging';
        if(this.active == -1 || this.active == -2){
            this.log.render();
        }else{
            this.files[this.active].render();
        }
    }

    createFile(name){
        this.files[name] = new prog();
    }

    run(name){
        this.log.println("Starting . . .");
        if(this.files[name] != null){
            this.active = -2;
            this.log.setCursorStyle("off");
            this.files[name].parse();
            this.active = -1;
            this.log.setCursorStyle("blink");
        }else{
            this.log.println("Error: file " + name + " not found!");
        }
    }
    
    editFile(name){
        if(this.files[name] != null){
            this.active = name;
        }else{
            this.log.println("Error: file " + name + " not found!");
        }
    }

    exitEditor(){
        this.active = -1;
    }
}

// Respond to console commands
class ConsoleListener{
    constructor(term){
        this.term = term;
        this.prompt = "";
        this.term.print(">")
    }

    keyHandle(key){
        console.log(key);                                            // remove in final build
        if(key == 'Enter'){  // return
            this.enter();
        }else if(key == 'Backspace'){ // delete
            this.delete();
        }else if(key.length == 1){ // Only if its a single character
            this.write(key);
        }
    }

    write(c){
        this.term.print(c);
        this.prompt += c;
    }

    delete(){
        if(this.prompt.length < 70){
            if(this.term.cursorX > 1){
                this.term.setCursorPos(this.term.cursorX - 1, this.term.cursorY);
                this.term.putcar(" ", this.term.cursorX, this.term.cursorY);
                this.prompt = this.prompt.substring(0, this.prompt.length - 1);
            }
        }else{
            this.term.setCursorPos(this.term.cursorX - 1, this.term.cursorY);
            if(this.term.cursorX == -1){
                this.term.setCursorPos(71, this.term.cursorY-1);
            }
            this.term.putcar(" ", this.term.cursorX, this.term.cursorY);
            this.prompt = this.prompt.substring(0, this.prompt.length - 1);
        }
    }

    enter(){
        this.term.newLine();
        if(this.prompt.length > 0){
            this.parse(this.prompt);
        }
        this.prompt = "";
        this.term.print(">");
    }

    parse(str){
        switch(str.toUpperCase().split(" ")[0]){
            case "DIR":
                for(var name in os.files){
                    this.term.println(name);
                }
            break;
            case "NEW":
                if(str.toUpperCase().split(" ").length == 2 && str.toUpperCase().split(" ")[1].length > 0){
                    os.createFile(str.toUpperCase().split(" ")[1]);
                    this.term.println("Created " + str.toUpperCase().split(" ")[1]);
                }else{
                    this.term.println("Wrong number of arguments!");
                }
            break;
            case "EDIT":
                if(str.toUpperCase().split(" ").length == 2){
                    os.editFile(str.toUpperCase().split(" ")[1]);
                    this.term.println("Saved " + str.toUpperCase().split(" ")[1]);
                }else{
                    this.term.println("Wrong number of arguments!");
                }
            break;
            case "RUN":
                if(str.toUpperCase().split(" ").length == 2){
                    os.run(str.toUpperCase().split(" ")[1]);
                }else{
                    this.term.println("Wrong number of arguments!");
                }
            break;
            default:
                this.term.println("unknown command");
            break;
        }
    }
}

// Hold user code + allow editiing
class prog{
    constructor(){
        this.lines = [];
        this.pos = 0;
        this.linePos = 0;
        this.lines[0] = " ";
        this.offset = 0;
        this.curState = true;
        this.workedId = setInterval(() => {
            this._updateCursor();
        }, 500);
    }

    keyHandle(key){
        switch(key){
            case "Enter":
                this.pos = 0;
                this.linePos++;
                this.pushLine(this.linePos);
                if(this.linePos * 15 - this.offset > 465 && this.offset < 465){
                    this.offset += 15;
                }
            break;
            case "Shift":

            break;
            case "Escape":
                os.exitEditor();
            break;
            case "Backspace":
                if(this.pos > 0){
                    this.lines[this.linePos] = this.delChar(this.pos-1, this.lines[this.linePos]);
                    this.pos--;
                }else{
                    if(this.lines[this.linePos].length <= 1){
                        if(this.linePos > 0){
                            this.popLine(this.linePos);
                            this.linePos--;
                            this.pos = this.lines[this.linePos].length - 1;
                        }
                    }else{
                        this.lines[this.linePos] = this.delChar(0, this.lines[this.linePos]);
                    }
                }
                if(this.linePos * 15 - this.offset < 0 && this.offset > 0){
                    this.offset -= 15;
                }
            break;
            case "ArrowDown":
                if(this.linePos < this.lines.length - 1){
                    this.linePos++;
                }else{
                    this.lines[this.lines.length] = " ";
                    this.linePos++;
                }
                if(this.lines[this.linePos].length - 1 < this.pos){
                    this.pos = this.lines[this.linePos].length - 1;
                }
                if(this.linePos * 15 - this.offset > 465 && this.offset > 465){
                    this.offset += 15;
                }
            break;
            case "ArrowUp":
                if(this.linePos > 0){
                    this.linePos--;
                    if(this.lines[this.linePos].length - 1 < this.pos){
                        this.pos = this.lines[this.linePos].length - 1;
                    }
                }
                if(this.linePos * 15 - this.offset < 0 && this.offset > 0){
                    this.offset -= 15;
                }
            break;
            case "ArrowLeft":
                if(this.pos > 0){
                    this.pos--;
                }else{
                    if(this.linePos > 0){
                        this.linePos--;
                        this.pos = this.lines[this.linePos].length - 1;
                    }
                }
                if(this.linePos * 15 - this.offset > 465 && this.offset < 465){
                    this.offset += 15;
                }
            break;
            case "ArrowRight":
                if(this.pos < this.lines[this.linePos].length - 1){
                    this.pos++;
                }else{
                    if(this.linePos < this.lines.length - 1){
                        this.pos = 0;
                        this.linePos++;
                    }
                }
            break;
            default:
                if(true){
                    this.lines[this.linePos] = this.setChar(this.pos, this.lines[this.linePos], key.substr(0, 1));
                    this.lines[this.linePos] = this.lines[this.linePos] + " "
                    this.pos++;
                }
            break;
        }
    }

    setChar(index, str, char){
        return str.substr(0, index) + char + str.substr(index + 1, str.length-1);
    }

    delChar(index, str){
        return str.substr(0, index) + str.substr(index + 1, str.length - 1);
    }

    popLine(index){
        if(this.lines.length > 1){
            this.lines.splice(index, 1);
        }
    }

    _updateCursor() {
        this.curState = !this.curState;
    }

    pushLine(index){
        this.lines.splice(index, 0, " ");
    }

    render(){
        bufCtx.fillStyle = '#00FF00';
        bufCtx.textAlign = 'start';
        bufCtx.textBaseline = 'hanging';
        this.renline = 0;
        for(var line = 0; line < this.lines.length && this.renline < this.lines.length; line++){
            this.counter = 2;
            bufCtx.fillText(line + ":", 1137, this.renline*15 + 75 - this.offset, 20, 15);
            for(var char = 0; char < this.lines[line].length; char++){
                bufCtx.fillText(this.lines[line].substring(char, char + 1), this.counter*10 + 1137, this.renline*15 + 75 - this.offset, 10, 15);
                if(line == this.linePos && char == this.pos && this.curState){
                    bufCtx.fillRect(this.counter*10 + 1137, this.renline*15 + 75 - this.offset, 10, 15);
                }
                this.counter++;
                if(this.counter > 71){
                    this.counter = 1;
                    this.renline++;
                }
            }
            this.renline++;
        }
    }

    parse(){
        intertpert(this.lines);
        os.log.println("Stopping interperter.");
    }
}

class stateController{

}

function intertpert(program){
    running = true;

    //parser state data
    this.cycles = 0;
    this.line = 0;
    this.crashed = false;
    this.nestLevel = 0;

    //stored data
    this.vars = [];
    this.labels = [];
    
    // prebuilder
    try{
        for(l = 0; l < program.length; l++){
            this.activeLine = program[l].replace(/\s+/g, '').toUpperCase();
            //label parser
            if(this.activeLine.indexOf("(") != -1 && this.activeLine.indexOf(")") != -1 && this.activeLine.indexOf("(") < this.activeLine.indexOf(")") && this.activeLine.split("(")[0] == "LBL"){
                this.labels[this.activeLine.split("(")[1].split(")")[0]] = l;
            }
        }

        // run
        while(running && cycles < 10000){
            if(this.line >= program.length){
                break;
            }
            this.activeLine = program[this.line].replace(/\s+/g, '').toUpperCase();
            if(this.nestLevel == 0){
                if(this.activeLine.indexOf("(") != -1 && this.activeLine.indexOf(")") != -1 && this.activeLine.indexOf("(") < this.activeLine.indexOf(")")){
                    this.command = this.activeLine.split("(")[0];
                    this.arguments = this.activeLine.split("(")[1].split(")")[0];
                    switch(this.command){
                        case "LOG":
                            if(this.vars[this.arguments] != null){
                                os.log.println("[@]" + this.vars[this.arguments]);
                            }else{
                                os.log.println("[@]" + this.arguments);
                            }
                        break;
                        case "FACE":
                            if(this.arguments == "R" || this.arguments == "L" || this.arguments == "U" || this.arguments == "D"){
                                bot.face(this.arguments);
                            }else{
                                os.log.println("Unknown argument at line " + this.line);
                                this.crashed = true;
                            }
                        break;
                        case "STEP":
                            if(this.arguments == ""){
                                console.log("help me please");
                                bot.step();
                                console.log("help me please2");
                            }else{
                                os.log.println("Unknown argument at line " + this.line);
                                this.crashed = true;
                            }
                        break;
                        case "BREAK":
                            os.log.println("Terminated at line " + this.line + " with exit code " + this.arguments);
                            this.crashed = true;
                        break;
                        case "GOTO":
                            if(this.labels[this.arguments] == null){
                                os.log.println("Unknown label " + this.arguments + " at line " + this.line);
                                this.crashed = true;
                            }else{
                                this.line = this.labels[this.arguments];
                            }
                        break;
                        case "IF":
                            if(this.arguments.length > 0){
                                this.subArgs = this.arguments.split(",");
                                if(this.subArgs.length == 3){
                                    if(this.vars[this.subArgs[0]] != null){
                                        this.val1 = this.vars[this.subArgs[0]];
                                    }else{
                                        if(!isNaN(+this.subArgs[0])){
                                            this.val1 = +this.subArgs[0];
                                        }else{
                                            os.log.println("Invalid var/val " + this.subArgs[0] + " at line " + this.line);
                                            this.crashed = true;
                                            break;
                                        }
                                    }
                                    if(this.vars[this.subArgs[2]] != null){
                                        this.val2 = this.vars[this.subArgs[2]];
                                    }else{
                                        if(!isNaN(+this.subArgs[2])){
                                            this.val2 = +this.subArgs[2];
                                        }else{
                                            os.log.println("Invalid var/val " + this.subArgs[2] + " at line " + this.line);
                                            this.crashed = true;
                                            break;
                                        }
                                    }
                                    switch(this.subArgs[1]){
                                        case "==":
                                            if(!(this.val1 == this.val2)){
                                                this.nestLevel++;
                                            }
                                        break;
                                        case "<=":
                                            if(!(this.val1 <= this.val2)){
                                                this.nestLevel++;
                                            }
                                        break;
                                        case ">=":
                                            if(!(this.val1 >= this.val2)){
                                                this.nestLevel++;
                                            }
                                        break;
                                        case "!=":
                                            if(!(this.val1 =! this.val2)){
                                                this.nestLevel++;
                                            }
                                        break;
                                        case ">":
                                            if(!(this.val1 > this.val2)){
                                                this.nestLevel++;
                                            }
                                        break;
                                        case "<":
                                            if(!(this.val1 < this.val2)){
                                                this.nestLevel++;
                                            } 
                                        break;
                                        default:
                                            os.log.println("Invalid comparator " + this.subArgs[1] + " at line " + this.line);
                                        break;
                                    }
                                }
                            }
                        break;
                        case "LBL":
                            
                        break;
                        case "END":
                            
                        break;
                        case "SET":
                            this.subArgs = this.arguments.split(",");
                            if(this.subArgs.length == 2){
                                if(this.subArgs[1].indexOf("+") != -1){
                                    if(this.vars[this.subArgs[1].split("+")[0]] != null){
                                        this.val1 = this.vars[this.subArgs[1].split("+")[0]];
                                    }
                                    if(this.vars[this.subArgs[1].split("+")[1]] != null){
                                        this.val2 = this.vars[this.subArgs[1].split("+")[0]];
                                    }
                                    this.val = (+this.val1) + (+this.val2);
                                }else if(this.subArgs[1].indexOf("-") != -1){
                                    if(this.vars[this.subArgs[1].split("-")[0]] != null){
                                        this.val1 = this.vars[this.subArgs[1].split("-")[0]];
                                    }
                                    if(this.vars[this.subArgs[1].split("+")[1]] != null){
                                        this.val2 = this.vars[this.subArgs[1].split("-")[0]];
                                    }
                                    this.val = (+this.val1) - (+this.val2);
                                }else{
                                    if(this.vars[this.subArgs[1]] == null){
                                        this.val = this.subArgs[1];
                                    }else{
                                        this.val = this.vars[this.subArgs[1]];
                                    }
                                }
                                this.vars[this.subArgs[0]] = this.val;
                            }else{
                                os.log.println("Wrong number of args at line " + this.line);
                                this.crashed = true;
                            }
                        break;
                        default:
                            os.log.println("Unknown command at line " + this.line);
                            this.crashed = true;
                        break; 
                    }
                }else{
                    if(program[this.line].length > 1){
                        os.log.println("Improper syntax at line " + this.line);
                        this.crashed = true;
                    }
                }
            }else{
                if(this.activeLine.indexOf("(") != -1 && this.activeLine.indexOf(")") != -1 && this.activeLine.indexOf("(") < this.activeLine.indexOf(")")){
                    this.command = this.activeLine.split("(")[0];
                    this.arguments = this.activeLine.split("(")[1].split(")")[0];
                    switch(this.command){
                        case "LOG":
                            
                        break;
                        case "FACE":
                            
                        break;
                        case "STEP":
                            
                        break;
                        case "BREAK":
                            
                        break;
                        case "GOTO":
                            
                        break;
                        case "IF":
                            this.nestLevel++;
                        break;
                        case "LBL":
                            
                        break;
                        case "END":
                            this.nestLevel--;
                        break;
                        case "SET":

                        break;
                        default:
                            os.log.println("Unknown command at line " + this.line);
                            this.crashed = true;
                        break; 
                    }
                }else{
                    if(program[this.line].length > 1){
                        os.log.println("Improper syntax at line " + this.line);
                        this.crashed = true;
                    }
                }
            }
            if(this.crashed == true){
                break;
            }
            line++;
            cycles++;
        }
        if(!(this.cycles < 10000)){
            os.log.println("Exceeded cycle limit!");
        }else if(this.crashed){
            os.log.println("Halted!");
        }else{
            os.log.println("Done!");
        }
        running = false;
    }catch(e){
        os.log.println("An unexpected error occured, crashing the interperter! Check the browser console for more info");
    }
}

// Game View Canvas
const canvas = document.getElementById('gameview');
const ctx = canvas.getContext('2d');

//textures
const overlay = document.getElementById('overlay');
const atlas = document.getElementById('atlas');

// Buffer
const bufCnv = document.createElement('canvas');
bufCnv.width = 1920;
bufCnv.height = 1080;
const bufCtx = bufCnv.getContext('2d');

// Configuration
const FRAME_RATE = 60;
const X_RES = 1920;
const Y_RES = 1080;

// Terminal controller
let os = new osObj();

let gameController = new stateController();

var activemap = new tilemap(16, 12);

var bot = new robot(activemap);

var running = false; // is interperter running?

// Start program
main();

// Initialization
function main(){
    console.log("Game loaded!");                    // Remove in final build
    setInterval(gameLoop, 1000 / FRAME_RATE);
    activemap.putMap(defineMap(0));
    bot.right();
    bot.face("R");
}

// Game loop
function gameLoop() {       
    clearBuffer();    
    //term.render();                                  // To do: only render on update to console? 
    os.render();
    activemap.draw(61, 183);
    bot.draw(61, 183);
    push();
}

// Clear the draw buffer 
function clearBuffer() {
    bufCtx.fillStyle = 'white'
    bufCtx.fillRect(0, 0, X_RES, Y_RES);
}

// Push from buffer to live canvas
function push() {
    bufCtx.drawImage(overlay, 0, 0, 1920, 1080);
    ctx.drawImage(bufCnv, 0, 0);
}

// 2D Array constructor
function makeArray(w, h, val) {
    var arr = [];
    for(i = 0; i < h; i++) {
        arr[i] = [];
        for(j = 0; j < w; j++) {
            arr[i][j] = val;
        }
    }
    return arr;
}

// Draw a specific texture from the atlas at (x, y)
function drawTexture(id, x, y){
    bufCtx.drawImage(atlas, (id%8)*32, ((id-(id%8))/8)*32, 32, 32, x, y, 64, 64);
}

// Canvas handling: WARNING? PROBLY KNOT WORKING.......
window.addEventListener('keydown', keyHandler, true);
function keyHandler(e) {
    os.input(e.key);
}

function defineMap(level){
    var map = makeArray(12, 16, -1);
    switch(level){
        case 0:
            map[0][0] = 3;
            map[5][0] = 0;
            map[15][11] = 1;
        break;
    }
    return map;
}