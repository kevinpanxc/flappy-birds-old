var Score = (function () {

	var high_score = 0;

	return {
		display_big_score : function (score) {
			var elemscore = $("#bigscore");
			elemscore.empty();

			var digits = score.toString().split('');

			for(var i = 0; i < digits.length; i++)
				elemscore.append("<img src='images/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
		},

		remove_big_score : function () {
			var elemscore = $("#bigscore");
			elemscore.empty();
		},

		display_small_score : function (score) {
			var elemscore = $("#currentscore");
			elemscore.empty();

			var digits = score.toString().split('');

			for(var i = 0; i < digits.length; i++)
				elemscore.append("<img src='images/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
		},

		display_high_score : function (score) {
			var elemscore = $("#highscore");
			elemscore.empty();

			var digits = high_score.toString().split('');
			for(var i = 0; i < digits.length; i++)
				elemscore.append("<img src='images/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
		}, 

		get_high_score : function () {
			return high_score;
		},

		set_high_score : function (score) {
			high_score = score;
		}
	}
})();