(function(){
    "use strict";
    var start_flag = false;
    var player,
        spd = 2,
        scope = 4; // 倍率
    // main
    var h = $("<div>").appendTo("body").css({
        "text-align": "center",
        padding: "1em"
    });
    $("<div>").appendTo(h).text("キーボードの十字キーでこのキャラクターを操作できます。");

    var input_n = yaju1919.addInputNumber(h,{
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

    yaju1919.addInputNumber(h,{
        title: "画面の拡大倍率",
        int: true,
        value: 4,
        min: 0,
        change: function(n){
            scope = n;
        }
    });

    yaju1919.addInputNumber(h,{
        title: "移動速度[px]",
        int: true,
        value: 3,
        min: 0,
        change: function(n){
            spd = n;
        }
    });

    var input_m = yaju1919.addInputNumber(h,{
        title: "モーション時間[ミリ秒]",
        int: true,
        value: 500,
        min: 1,
    });

    var h_cv = $("<div>").appendTo(h);

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
        function direct(char){ // 隠す
            p.direct = char;
        }
        var sprite = {
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
        var cv = $("<canvas>").attr({
            width: $(window).width() * 0.9,
            height: $(window).height() * 0.9
        });//.css("background-color","black");
        var ctx = cv.get(0).getContext('2d');
        // ドットを滑らかにしないおまじない
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        //
        drawAll(ctx);
        h_cv.empty().append(cv);
    }

    init();

    //-----------------------------------------------------
    //複数のキー入力を同時検出
    var keys = {};
    $(document).keydown(function(e){
        keys[e.key] = true;
    }).keyup(function(e){
        delete keys[e.key];
    });
    function player_move () {
        if(!player) return;
        var x = 0, y = 0, diag = 0.7;
        var w = keys.ArrowUp,
            s = keys.ArrowDown,
            a = keys.ArrowLeft,
            d = keys.ArrowRight;
        if(w && a){
            y = -spd * diag;
            x = -spd * diag;
        }
        else if(w && d){
            y = -spd * diag;
            x = spd * diag;
        }
        else if(s && a){
            y = spd * diag;
            x = -spd * diag;
        }
        else if(s && d){
            y = spd * diag;
            x = spd * diag;
        }
        else if(w){
            y = -spd;
            player.direct('w');
        }
        else if(s){
            y = spd;
            player.direct('s');
        }
        else if(a){
            x = -spd;
            player.direct('a');
        }
        else if(d){
            x = spd;
            player.direct('d');
        }
        player.move(x,y);
    }

    start_flag = true;
    $("#input_n").trigger("change");
})();
