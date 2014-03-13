server_data = (function () {
	var my_id = "";

	var allVisibleBirds = {};

	return {
		setId : function (id) {
			my_id = id;
		},

		getId : function () {
			return my_id;
		},

		setVisibleBirdsData : function () {
			
		}
	}
})();