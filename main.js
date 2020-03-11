(function(){
    "use strict";
    var start_flag = false;
    var player,
        spd = 2,
        scope = 4; // 倍率
    // main
    var holder = $("<div>").appendTo("body").css({
        "text-align": "center",
        padding: "1em"
    });
    $("<h1>").appendTo(holder).text("RPGENの素材を動かすテスト");
    $("<div>").appendTo(holder).text("キーボードの十字キー or 画面クリック で、");
    $("<div>").appendTo(holder).text("このキャラクターを操作できます。");
    holder.append("<br><br>");

    var input_n = yaju1919.addInputNumber(holder,{
        id: "input_n",
        title: "スプライトアニメーションの番号",
        int: true,
        value: 1194,
        min: 1,
        change: function(n){
            if(!start_flag) return;
            player = makeAnime({
                url: "http://rpgen.pw/dq/sAnims/res/" + n + ".png",
                anime: input_m()
            });
        }
    });

    yaju1919.addInputNumber(holder,{
        title: "画面の拡大倍率",
        int: true,
        value: 4,
        min: 0,
        change: function(n){
            scope = n;
        }
    });

    yaju1919.addInputNumber(holder,{
        title: "移動速度[px]",
        int: true,
        value: 3,
        min: 0,
        change: function(n){
            spd = n;
        }
    });

    var input_m = yaju1919.addInputNumber(holder,{
        title: "モーション時間[ミリ秒]",
        int: true,
        value: 500,
        min: 1,
    });

    var holder_cv = $("<div>").appendTo(holder);
    var cv, ctx, cv_w, cv_h, cv_x, cv_y;

    function resetCanvas(){ // canvasの再設定
        cv_w = $(window).width() * 0.9;
        cv_h = $(window).height() * 0.7;
        if(cv) cv.remove();
        cv = $("<canvas>").attr({ // ゲームの画面
            width: cv_w,
            height: cv_h
        }).appendTo(holder_cv);
        cv_x = cv.offset().left;
        cv_y = cv.offset().top;
        ctx = cv.get(0).getContext('2d');
        // ドットを滑らかにしないおまじない
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
    }
    $(window).resize(resetCanvas);
    resetCanvas();

    // キャラクター十字移動

    var list_z = {};

    var nowTime;
    function drawAll (ctx) { // 全てを描画
        nowTime = new Date();
        Object.keys(list_z).map(function(v){
            return Number(v);
        }).filter(function(v){
            return !isNaN(v);
        }).sort(function(a,b){
            return a < b ? 1 : -1; // 降順ソート
        }).forEach(function(v){
            list_z[String(v)].forEach(function(spr){
                if(spr.isHide) return;
                spr.draw(ctx);
            });
        });
    }

    function makeAnime(param){ // RPGEN
        var p = yaju1919.init(param,{
            x: 0,
            y: 0,
            z: 0,
            direct: 's', // 向き asdw
            isHide: false,
            url: '',
            anime: 500, // モーションが切り替わるまでの時間
        });
        var img = new Image();
        img.onerror = function(){
            img.src = 'http://rpgen.us/dq/sAnims/img/404.png';
        };
        img.src = p.url;
        function draw(ctx, param){
            var wh = yaju1919.init(param,{
                w: 16,
                h: 16,
            });
            var sy = 0;
            switch(p.direct){
                case 'w':
                    sy = 0;
                    break;
                case 's':
                    sy = 32;
                    break;
                case 'a':
                    sy = 48;
                    break;
                case 'd':
                    sy = 16;
                    break;
            }
            var sx = (Math.floor(nowTime/p.anime) % 2 ) * 16;
            ctx.drawImage(img, sx, sy, 16, 16, p.x * scope, p.y * scope, wh.w * scope, wh.h * scope);
        }
        function getXY(){ // 座標を取得
            return [ p.x, p.y ];
        }
        function jump(x,y){ // 絶対移動
            p.x = x;
            p.y = y;
        }
        function move(x,y){ // 相対移動
            p.x += x;
            p.y += y;
        }
        function hide(bool){ // 隠す
            p.isHide = bool;
        }
        function direct(char){ // 向きを変更 char: asdw
            p.direct = char;
        }
        var sprite = {
            getXY: getXY,
            draw: draw,
            jump: jump,
            move: move,
            hide: hide,
            direct: direct,
        };
        if(!list_z[String(p.z)]) list_z[String(p.z)] = [];
        list_z[String(p.z)].push(sprite);
        return sprite;
    }

    function init () {
        requestAnimationFrame(update);
    }

    function update () {
        requestAnimationFrame(update);
        player_move();
        render();
    }

    function render () {
        ctx.clearRect(0, 0, cv_w, cv_h);
        drawAll(ctx);
    }

    init();

    //-----------------------------------------------------
    // 複数のキー入力を同時検出
    var keys = {};
    $(document).keydown(function(e){
        keys[e.key] = true;
        if(e.key.indexOf("Arrow") !== -1) e.preventDefault();
    }).keyup(function(e){
        delete keys[e.key];
    });

    // カーソルの現在位置
    var NotKeyboard_flag = true,
        touchDevice_flag, cursor_x, cursor_y;
    // マウスデバイス
    function mouse(e){
        if(touchDevice_flag) return;
        NotKeyboard_flag = e.which === 1;
        cursor_x = e.pageX - cv_x;
        cursor_y = e.pageY - cv_y;
    }
    $(document).mousedown(mouse).mousemove(mouse).mouseup(function(){
        if(touchDevice_flag) return;
        NotKeyboard_flag = false;
    });
    // タッチデバイス
    function touch(e){
        touchDevice_flag = true;
        NotKeyboard_flag = true;
        cursor_x = e.pageX - cv_x;
        cursor_y = e.pageY - cv_y;
    }
    $(document).on('touchstart',touch).on('touchmove',touch).on('touchend',function(){
        NotKeyboard_flag = false;
    });
    var lastSubY;
    function player_move () {
        if(!player) return;
        var x = 0, y = 0, rad;
        var w = keys.ArrowUp,
            s = keys.ArrowDown,
            a = keys.ArrowLeft,
            d = keys.ArrowRight;
        if(NotKeyboard_flag){
            var pXY = player.getXY();
            var pX = pXY[0] * scope + 8 * scope,
                pY = pXY[1] * scope + 8 * scope;
            var subX = cursor_x - pX,
                subY = cursor_y - pY;
            var tolerance = scope * spd; // 許容誤差
            if(Math.abs(subX) < tolerance) {
                a = d = false;
                subX = 0;
            }
            if(Math.abs(subY) < tolerance) {
                w = s = false;
                subY = 0;
            }
            if(!subX && !subY) return player.direct(lastSubY > 0 ? 's' : 'w'); // 動かない
            lastSubY = subY;
            d = !(a = subX < 0);
            s = !(w = subY < 0);
            rad = Math.atan2(subY, subX);
        }
        else {
            var deg;
            if(w && d) deg = -45;
            else if(w && a) deg = -135;
            else if(s && a) deg = 135;
            else if(s && d) deg = 45;
            else if(d) deg = 0;
            else if(w) deg = -90;
            else if(a) deg = 180;
            else if(s) deg = 90;
            rad = deg * (Math.PI / 180);
        }
        if(rad || rad === 0){
            x = Math.cos(rad) * spd;
            y = Math.sin(rad) * spd;
        }

        // 向きの設定-------------------------
        if(a){
            player.direct('a');
        }
        else if(d){
            player.direct('d');
        }
        else if(s){
            player.direct('s');
        }
        else if(w){
            player.direct('w');
        }
        //-------------------------------------

        player.move(x,y);
    }

    start_flag = true;
    $("#input_n").trigger("change");
})();
