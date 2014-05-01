var Animator = (function () {

    return {
        start_animations: function () {
            var animated = $(".animated");
            animated.css('animation-play-state', 'running');
            animated.css('-webkit-animation-play-state', 'running');
        },

        end_animations: function () {
            var animated = $(".animated");
            animated.css('animation-play-state', 'paused');
            animated.css('-webkit-animation-play-state', 'paused');
            animated.stop();
        },

        end_bird_animations: function (id) {
            var bird = $("#"+id);
            // bird.removeClass("bird-flapping-wings");
            bird.css('animation-play-state', 'paused');
            bird.css('-webkit-animation-play-state', 'paused');
        },

        move_bird_back: function (id) {
            var bird = $("#"+id);
            var x_position_string = bird.css("x");
            var x = parseFloat(x_position_string.substr(0, x_position_string.length - 2));
            var distance_to_move = x + 100;
            var time_to_move = distance_to_move / (0.4 / 3)
            bird.animate({
                left: "-=" + distance_to_move
            }, time_to_move, "linear", function () {
                bird.remove();
            });
        }
    }
})();