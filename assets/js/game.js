var Game = (function () {
    var states = Object.freeze({
        SPLASH_SCREEN: 0,
        GAME_SCREEN: 1,
        SCORE_SCREEN: 2,
        WAITING_FOR_SERVER: 3
    });

    var current_state;
    var bird;
    var bird_array = {};
    var replay_clickable = false;

    var loop_game;
    var loop_pipe;

    var socket;
    var url = 'http://localhost:3700';

    var get_cookie = function (c_name) {
        var name = c_name + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i < ca.length; i++) {
            var c = ca[i].trim();
            if (c.indexOf(name)==0) return c.substring(name.length,c.length);
        }
        return "";        
    }

    var set_cookie = function (c_name, c_value, expire_days) {
        var d = new Date();
        d.setTime(d.getTime()+(expire_days*24*60*60*1000));
        var expires = "expires=" + d.toGMTString();
        document.cookie = c_name + "=" + c_value + "; " + expires;
    }

    var add_bird = function(data) {
        console.log(data);
        var new_bird = new Bird(data.velocity, data.position, data.rotation, data.id);
        new_bird.addToFlyArea(data.time_diff);
        bird_array[data.id] = new_bird;
    }

    var show_splash = function () {
        remove_all_birds();
        Sounds.playSoundSwoosh();
        remove_pipes();
        fade_in_splash();
    }

    var fade_in_splash = function () {
        $("#splash").transition({ opacity: 1 }, 2000, 'ease');
    }

    var fade_out_splash = function () {
        $("#splash").stop();
        $("#splash").transition({ opacity: 0 }, 500, 'ease');
    }

    var remove_pipes = function () {
        $(".pipe").remove();
        pipe_data_container.clearPipes();
    }

    var game_loop_function = function () {
        bird.updateBird();
        update_all_birds();
        if (!bird.checkAlive()) end_run();
    }

    var update_all_birds = function () {
        for (var client_id in bird_array) {
            if (!bird_array[client_id].is_dead) bird_array[client_id].updateBird();
        }
    }

    var remove_all_birds = function () {
        for (var bird in bird_array) {
            bird_array[bird].remove();
        }
    }

    var set_medal = function () {
        var medal_element = $("#medal");
        medal_element.empty();

        if (bird.score < 10) return false; // no medal
        else if (bird.score < 20) medal = "bronze";
        else if (bird.score < 30) medal = "silver";
        else if (bird.score < 40) medal = "gold";
        else medal = "platinum";

        medal_element.append('<img src="images/medal_' + medal +'.png" alt="' + medal +'">');

        return true;
    }

    var screen_click = function () {
        if (current_state == states.GAME_SCREEN) {
            socket.emit('bird-jump', bird.playerId);
            socket.emit('state-update', { client_id : bird.playerId, state : "PLAYING" });
            bird.jump();
        } else if (current_state == states.SPLASH_SCREEN) {
            start_run();
        }
    }

    var start_run = function () {
        Animator.start_animations();
        current_state = states.GAME_SCREEN;

        socket.emit('start-game', bird.playerId);
        socket.emit('sync-request', bird.playerId);
        socket.emit('state-update', { client_id : bird.playerId, state : "PLAYING" });

        fade_out_splash();

        Score.display_big_score(bird.score);

        var update_rate = 1000.0 / 60.0; // 60 times a second

        loop_game = setInterval(game_loop_function, update_rate);
        loop_pipe = setInterval(pipe_loop_function, 1400);

        bird.jump();
    }

    var end_run = function () {
        socket.emit('bird-death-request', bird.playerId);
        socket.emit('state-update', { client_id : bird.playerId, state : "IDLE" });
        bird.die();

        Animator.end_animations();

        current_state = states.SCORE_SCREEN;

        clearInterval(loop_game);
        clearInterval(loop_pipe);

        pipe_data_container.resetIndex();

        if (is_incompatible.any()) show_score();
        else {
            Sounds.playSoundHit().bindOnce("ended", function() {
                Sounds.playSoundDie().bindOnce("ended", function() {
                    show_score();
                });
            });
        }
    }

    var show_score = function () {
        $("#scoreboard").css("display", "block");

        Score.remove_big_score();

        if (bird.score > Score.get_high_score()) {
            Score.set_high_score(bird.score);
            set_cookie("high_score", Score.get_high_score(), 999);
        }

        Score.display_small_score(bird.score);

        Score.display_high_score(bird.score);

        var medal = set_medal();

        Sounds.playSoundSwoosh();

        $("#scoreboard").css({ y: '40px', opacity: 0 }); //move it down so we can slide it up
        $("#replay").css({ y: '40px', opacity: 0 });
        $("#scoreboard").transition({ y: '0px', opacity: 1}, 600, 'ease', function() {
        //When the animation is done, animate in the replay button and SWOOSH!
            Sounds.playSoundSwoosh();

            $("#replay").transition({ y: '0px', opacity: 1}, 600, 'ease');
            //also animate in the MEDAL! WOO!
            if(medal) {
                $("#medal").css({ scale: 2, opacity: 0 });
                $("#medal").transition({ opacity: 1, scale: 1 }, 1200, 'ease');
            }
        });

        replay_clickable = true;
    }

    var replay = function () {
        if (!replay_clickable) return;
        else replay_clickable = false;

        Sounds.playSoundSwoosh();

        $("#scoreboard").transition({ y: '-40px', opacity: 0}, 1000, 'ease', function() {
            //when that's done, display us back to nothing
            $("#scoreboard").css("display", "none");

            //start the game over!
            show_splash();
            current_state = states.SPLASH_SCREEN;
            bird.reset();
        });
    }

    var pipe_loop_function = function () {
        //Do any pipes need removal?
        $(".pipe").filter(function() { return $(this).position().left <= -100; }).remove();

        socket.emit('pipe-request', {
          index: pipe_data_container.getAndIncrementPipeIndex()
        });
    }

    var is_incompatible = {
        Android: function() {
            return navigator.userAgent.match(/Android/i);
        },
        BlackBerry: function() {
            return navigator.userAgent.match(/BlackBerry/i);
        },
        iOS: function() {
            return navigator.userAgent.match(/iPhone|iPad|iPod/i);
        },
        Opera: function() {
            return navigator.userAgent.match(/Opera Mini/i);
        },
        Safari: function() {
            return (navigator.userAgent.match(/OS X.*Safari/) && ! navigator.userAgent.match(/Chrome/));
        },
        Windows: function() {
            return navigator.userAgent.match(/IEMobile/i);
        },
        any: function() {
            return (is_incompatible.Android() || is_incompatible.BlackBerry() || is_incompatible.iOS() || is_incompatible.Opera() || is_incompatible.Safari() || is_incompatible.Windows());
        }
    }

    return {
        initialize : function () {
            if (window.location.search == "?easy") pipe_data_container.setEasyMode();

            var saved_score = get_cookie("high_score");

            if(saved_score != "") Score.set_high_score(parseInt(saved_score));

            current_state = states.WAITING_FOR_SERVER;

            socket = io.connect(url);

            socket.on('register-response', function(data) {
                bird = new Bird(0, 180, 0, data);
                bird.reset();

                current_state = states.SPLASH_SCREEN;
            });

            socket.on('pipe-response', function(data) {
                var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + data.topheight + 'px;"></div><div class="pipe_lower" style="height: ' + data.bottomheight + 'px;"></div></div>');
                $("#flyarea").append(newpipe);
                pipe_data_container.pushPipe(newpipe);            
            });

            socket.on('bird-jumped', function(data) {
                if (data !== bird.playerId && current_state == states.GAME_SCREEN) bird_array[data].jump();
            });

            socket.on('sync-response', function(data) {
                bird_array = {};
                for (client in data) {
                    add_bird(data[client]);
                }
            });

            socket.on('bird-death-response', function(data) {
                if (data !== bird.playerId && current_state == states.GAME_SCREEN) bird_array[data].die();
            });

            Animator.end_animations();

            show_splash();

            socket.emit('register-request', null);            
        },

        setup_controls : function () {
            $(document).keydown(function(e) {
                if(e.keyCode == 32) {
                    if (current_state == states.SCORE_SCREEN) replay();
                    else screen_click();
                }
            });

            $("#replay").click(replay);

            if ("ontouchstart" in window) $(document).on("touchstart", screen_click);
            else $(document).on("mousedown", screen_click);
        }
    }
})();

$(function () {
    Game.initialize();

    Game.setup_controls();
});