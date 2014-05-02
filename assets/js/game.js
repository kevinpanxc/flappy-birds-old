var Pipes = (function () {
    var pipe_index = 0;
    var pipe_height = 90;
    var pipe_width = 52;
    var all = new Array();

    var format_pipe_death_string = function (deaths) {
        if (deaths === 1) return '1 death';
        else return deaths + ' deaths';
    }

    return {
        get_pipe_and_increment_pipe_index: function () {
            return pipe_index++;
        },

        get_pipe_height: function () {
            return pipe_height;
        },

        get_pipe_width: function () {
            return pipe_width;
        },

        get_pipe: function (index) {
            return all[index];
        },

        add_pipe_to_fly_area: function (data) {
            var new_pipe = $('<div class="pipe animated">\
                <div class="pipe_upper" style="height: ' + data.pipe.top_height + 'px;"></div>\
                <div class="pipe_lower" style="height: ' + data.pipe.bottom_height + 'px;"></div>\
                <div class="pipe_death_counter" id="pipe_' + data.pipe_id + '">' + format_pipe_death_string(data.pipe.death_counter) + '</div>\
            </div>');
            $("#flyarea").append(new_pipe);
            all.push(new_pipe);
        },

        clear_pipes: function () {
            all = new Array();
        },

        remove_used_pipe: function () {
            all.splice(0, 1);
        },

        set_easy_mode: function() {
            pipe_height = 200;
        },

        reset_index: function (){
            pipe_index = 0;
        },

        update_pipe_death_counter: function (index, death_counter) {
            $('#pipe_' + index).html(format_pipe_death_string(death_counter));
        }
    }
})();

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
    var loop_check_connection;

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

    var add_external_client_as_bird = function(data) {
        var new_bird = new Bird(data.id, false, data.velocity, data.y_position, data.rotation);
        new_bird.add_to_fly_area(data.time_diff);
        bird_array[data.id] = new_bird;
    }

    var show_splash = function () {
        remove_all_birds();
        Sounds.play_swoosh();
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
        Pipes.clear_pipes();
    }

    var game_loop_function = function () {
        bird.update_bird();
        update_all_birds();
        if (!bird.check_alive()) end_run();
    }

    var update_all_birds = function () {
        for (var client_id in bird_array) {
            if (!bird_array[client_id].is_dead) bird_array[client_id].update_bird();
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
            Network.send.jump(bird.player_id);
            Network.send.update_state({ client_id : bird.player_id, state : "PLAYING" });
            bird.jump();
        } else if (current_state == states.SPLASH_SCREEN) {
            start_run();
        }
    }

    var start_run = function () {
        Animator.start_animations();
        current_state = states.GAME_SCREEN;

        Network.send.start_game(bird.player_id);
        Network.send.sync(bird.player_id);
        Network.send.update_state({ client_id : bird.player_id, state : "PLAYING" });

        fade_out_splash();

        Score.display_big_score(bird.score);

        var update_rate = 1000.0 / 60.0; // 60 times a second

        loop_game = setInterval(game_loop_function, update_rate);
        loop_pipe = setInterval(pipe_loop_function, 1400);

        bird.jump();
    }

    var end_run = function () {
        Network.send.death({ client_id : bird.player_id, client_score : bird.score });
        Network.send.update_state({ client_id : bird.player_id, state : "IDLE" })
        bird.die();

        Animator.end_animations();

        current_state = states.SCORE_SCREEN;

        clearInterval(loop_game);
        clearInterval(loop_pipe);

        Pipes.reset_index();

        if (is_incompatible.any()) show_score();
        else {
            Sounds.play_hit().bindOnce("ended", function() {
                Sounds.play_die().bindOnce("ended", function() {
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

        Sounds.play_swoosh();

        $("#scoreboard").css({ y: '40px', opacity: 0 }); //move it down so we can slide it up
        $("#replay").css({ y: '40px', opacity: 0 });
        $("#scoreboard").transition({ y: '0px', opacity: 1}, 600, 'ease', function() {
        //When the animation is done, animate in the replay button and SWOOSH!
            Sounds.play_swoosh();

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

        Sounds.play_swoosh();

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

        Network.send.new_pipe(Pipes.get_pipe_and_increment_pipe_index());
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
            if (window.location.search == "?easy") Pipes.set_easy_mode();

            var saved_score = get_cookie("high_score");

            if(saved_score != "") Score.set_high_score(parseInt(saved_score));

            current_state = states.WAITING_FOR_SERVER;

            Network.on.register_success(function(data) {
                bird = new Bird(data.client_id, true, 0, 180, 0);
                bird.add_to_fly_area(0);

                ExternalUI.update_connected_clients_count(Object.keys(data.clients).length);

                ExternalUI.update_connected_clients_list(data.clients);

                loop_check_connection = setInterval(function () {
                    Network.send.update_state({ client_id : bird.player_id });
                }, 5000);

                current_state = states.SPLASH_SCREEN;

                ExternalUI.remove_loading_blocker();
            });

            Network.on.pipe_returned(function(data) {
                Pipes.add_pipe_to_fly_area(data);
            });

            Network.on.bird_jumped(function(data) {
                if (data !== bird.player_id && current_state == states.GAME_SCREEN) bird_array[data].jump();
            });

            Network.on.sync_success(function(data) {
                bird_array = {};
                for (client in data) {
                    add_external_client_as_bird(data[client]);
                }
            });

            Network.on.bird_death(function(data) {
                if (data.client_id !== bird.player_id && current_state == states.GAME_SCREEN) {
                    Animator.end_bird_animations(data.client_id);
                    bird_array[data.client_id].die();
                    Animator.move_bird_back(data.client_id);
                }
                Pipes.update_pipe_death_counter(data.pipe.index, data.pipe.death_counter);
            });

            Animator.end_animations();

            show_splash();

            Network.send.register(null);
        },

        setup_controls : function () {
            $(document).keydown(function(e) {
                if(e.keyCode == 32) { // space bar
                    if (current_state == states.SCORE_SCREEN) replay();
                    else screen_click();
                }
            });

            $("#replay").click(replay);

            if ("ontouchstart" in window) $("#gamescreen").on("touchstart", screen_click);
            else $("#gamescreen").on("mousedown", screen_click);
        }
    }
})();

$(function () {
    Network.initialize();

    Game.initialize();

    Game.setup_controls();

    ExternalUI.initialize();
});