var Sounds = (function () {
	var volume = 30;

	var sound_jump = new buzz.sound("sounds/sfx_wing.ogg");
	var sound_score = new buzz.sound("sounds/sfx_point.ogg");
	var sound_hit = new buzz.sound("sounds/sfx_hit.ogg");
	var sound_die = new buzz.sound("sounds/sfx_die.ogg");
	var sound_swoosh = new buzz.sound("sounds/sfx_swooshing.ogg");

	buzz.all().setVolume(volume);

	return {
		play_jump : function () {
			sound_jump.stop();
			sound_jump.play();
		},

		play_score : function () {
			sound_score.stop();
			sound_score.play();
		},

		play_hit : function () {
			return sound_hit.play();
		},

		play_die : function () {
			return sound_die.play();
		},

		play_swoosh : function () {
			sound_swoosh.stop();
   			sound_swoosh.play();
		}
	}
})();