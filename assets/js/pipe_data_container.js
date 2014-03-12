var pipe_data_container = (function () {
	var pipeIndex = 0;
	var pipeheight = 90;
	var pipewidth = 52;
	var pipes = new Array();

	return {
		getAndIncrementPipeIndex: function () {
			return pipeIndex++;
		},

		getPipeHeight: function () {
			return pipeheight;
		},

		getPipeWidth: function () {
			return pipewidth;
		},

		getPipe: function (index) {
			return pipes[index];
		},

		pushPipe: function (pipe) {
			pipes.push(pipe);
		},

		clearPipes: function () {
			pipes = new Array();
		},

		removeUsedPipe: function () {
			pipes.splice(0, 1);
		},

		setEasyMode: function() {
			pipeheight = 200;
		},

		resetIndex: function (){
			pipeIndex = 0;
		}
	}
})();