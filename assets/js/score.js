var Score = (function () {

	return {
		setBigScore : function (score) {
			var elemscore = $("#bigscore");
			elemscore.empty();

			var digits = score.toString().split('');

			for(var i = 0; i < digits.length; i++)
				elemscore.append("<img src='images/font_big_" + digits[i] + ".png' alt='" + digits[i] + "'>");
		},

		removeBigScore : function () {
			var elemscore = $("#bigscore");
			elemscore.empty();
		},

		setSmallScore : function (score) {
			var elemscore = $("#currentscore");
			elemscore.empty();

			var digits = score.toString().split('');
			for(var i = 0; i < digits.length; i++)
				elemscore.append("<img src='images/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
		},

		setHighScore : function (score) {
			var elemscore = $("#highscore");
			elemscore.empty();

			var digits = highscore.toString().split('');
			for(var i = 0; i < digits.length; i++)
				elemscore.append("<img src='images/font_small_" + digits[i] + ".png' alt='" + digits[i] + "'>");
		}
	}
})();