// キャラクター十字移動

const list_z = {};

function drawAll (ctx) { // 全てを描画
    const ar = Object.keys(list_z).map(v=>Number(v)).filter(v=>!isNaN(v)).sort((a,b) => a < b ? 1 : -1); // 降順ソート
    for(const n of ar) {
        for(const spr of list_z[n]) {
            if(spr.isHide) continue;
            spr.draw(ctx);
        }
    }
}

class sprite {
    constructor({x,y,z,url,isHide}){
        this.x = x; // x座標
        this.y = y; // y座標
        if(!list_z[z]) list_z[z] = [];
        list_z[z].push(this); // z座標
        this.isHide = true; // 隠れるか
        this.img = new Image();
        this.img.onload = () => { // 読み込みが完了したら
            this.isHide = isHide;
        }
        this.img.src = url;
    }
    jump(x,y){ // 絶対移動
        this.x = x;
        this.y = y;
    }
    move(x,y){ // 相対移動
        this.x += x;
        this.y += y;
    }
    set hide(bool){ // true: 隠す
        this.isHide = bool;
    }
    draw(ctx){ // 描画
        ctx.drawImage(this.img, this.x, this.y);
    }
}

//----------------------------------------------------

const h = $("<div>").appendTo($("body"));

const h_cv = $("<div>").appendTo(h);

//----------------------------------------------------

function init () {
    requestAnimationFrame(update);
}

function update () {
    requestAnimationFrame(update);
    player_move();
    render();
}

function render () {
    const cv = $("<canvas>").css("background-color","black");
    const ctx = cv.get(0).getContext('2d');
    drawAll(ctx);
    h_cv.empty().append(cv);
}

init();

//----------------------------------------------------

var player = new sprite({
    x: 0,
    y: 0,
    z: 10,
    url: "https://www1.x-feeder.info/YUproject/pictures/PIC_zKz6RO.png",
    isHide: false
});

const speed = 3;
//-----------------------------------------------------
//複数のキー入力を同時検出
const keys = {};
$(document).keydown(function(e){
    keys[e.key] = true;
}).keyup(function(e){
    delete keys[e.key];
});
function player_move () {
    var x = 0, y = 0;
    const diag_rate = 0.7;
    let str = "";
    if(keys.ArrowUp) str += "u";
    if(keys.ArrowDown) str += "d";
    if(keys.ArrowLeft) str += "l";
    if(keys.ArrowRight) str += "r";
    switch (str) {
        case 'u':
            y = -speed;
            break;
        case 'd':
            y = speed;
            break;
        case 'r':
            x = speed;
            break;
        case 'l':
            x = -speed;
            break;
        case 'ul':
            y = -speed * diag_rate;
            x = -speed * diag_rate;
            break;
        case 'ur':
            y = -speed * diag_rate;
            x = speed * diag_rate;
            break;
        case 'dl':
            y = speed * diag_rate;
            x = -speed * diag_rate;
            break;
        case 'dr':
            y = speed * diag_rate;
            x = speed * diag_rate;
            break;
    }
    player.move(x,y);
}
