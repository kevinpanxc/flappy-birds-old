var background_animation = (function () {

	return {
		startAnimations: function () {
		   $(".animated").css('animation-play-state', 'running');
		   $(".animated").css('-webkit-animation-play-state', 'running');
		},

		endAnimations: function () {
		   $(".animated").css('animation-play-state', 'paused');
		   $(".animated").css('-webkit-animation-play-state', 'paused');
		}
	}
})();