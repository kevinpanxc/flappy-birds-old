var Sounds = (function () {
	var volume = 30;

	var soundJump = new buzz.sound("sounds/sfx_wing.ogg");
	var soundScore = new buzz.sound("sounds/sfx_point.ogg");
	var soundHit = new buzz.sound("sounds/sfx_hit.ogg");
	var soundDie = new buzz.sound("sounds/sfx_die.ogg");
	var soundSwoosh = new buzz.sound("sounds/sfx_swooshing.ogg");

	buzz.all().setVolume(volume);

	return {
		playSoundJump : function () {
			soundJump.stop();
			soundJump.play();
		},

		playSoundScore : function () {
			soundScore.stop();
			soundScore.play();
		},

		playSoundHit : function () {
			return soundHit.play();
		},

		playSoundDie : function () {
			return soundDie.play();
		},

		playSoundSwoosh : function () {
			soundSwoosh.stop();
   			soundSwoosh.play();
		}
	}
})();