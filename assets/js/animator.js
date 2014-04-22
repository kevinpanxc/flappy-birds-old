var Animator = (function () {

	return {
		start_animations: function () {
		   $(".animated").css('animation-play-state', 'running');
		   $(".animated").css('-webkit-animation-play-state', 'running');
		},

		end_animations: function () {
		   $(".animated").css('animation-play-state', 'paused');
		   $(".animated").css('-webkit-animation-play-state', 'paused');
		}
	}
})();