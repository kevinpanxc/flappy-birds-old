function Bird (velocity, position, rotation, playerId) {

	var gravity = 0.25;
	var jump = -4.6;

	var DEAD = false;
	var ALIVE = true;


	this.playerId = playerId;
	this.velocity = velocity;
	this.position = position;
	this.rotation = rotation;
	this.score = 0;

	this.reset = function(){
		this.addToFlyArea(0);

		//set the defaults (again)
		this.velocity = 0;
		this.position = 180;
		this.rotation = 0;
		this.score = 0;

		//update the player in preparation for the next game
		this.updateBird();
	}
	
	this.addToFlyArea = function(timediff){		
		var player = $("#"+this.playerId)
		if (player) player.remove();

	   	var overallBirdDiv = document.getElementById("birds");
	   	var newBird = document.createElement("div");
	   	newBird.className = "bird animated";
	   	newBird.id = this.playerId;
	   	overallBirdDiv.appendChild(newBird);

	   	$(newBird).css({ x: 60 + timediff * 0.1333});		
	}

	this.jump = function() {
	   this.velocity = jump;

	   Sounds.playSoundJump();
	}

	this.scored = function (){
	   this.score += 1;
	   Sounds.playSoundScore();
	   Score.display_big_score(this.score);
	}

   	this.updateBird = function(){

   		var player = $("#"+this.playerId);

	   	this.velocity += gravity;
	   	this.position += this.velocity;
  
	   	//rotation
	   	this.rotation = Math.min((this.velocity / 10) * 90, 90);
	   
	   	//apply rotation and position
	   	$(player).css({ rotate: this.rotation, top: this.position });
	}

	this.checkAlive = function(){
	 	var box = document.getElementById(this.playerId).getBoundingClientRect();
		
		var boxDimensions = this.getBoxDimensions(box);
	  
	   	if(this.touchGround(box)) return DEAD;
	   
	   	if(this.touchCeiling(boxDimensions.boxtop)) this.doNotAllowBirdToFlyHigher();

   		if(this.noPipesYet()) {
   			return ALIVE;
   		} else {
	   		var nextpipe = pipe_data_container.getPipe(0);

	   		var pipeDimensions = this.getPipeDimensions(nextpipe);
	   
	   		if(this.didWeCollideWithPipe(boxDimensions, pipeDimensions)) return DEAD;
	   
		   	if(this.didWePassPipe(boxDimensions.boxleft, pipeDimensions)) {
		      	pipe_data_container.removeUsedPipe();
		      
		      	this.scored();
		   	}
		   	return ALIVE;
   		}
	}

	this.touchGround = function (box) {
		return box.bottom >= $("#land").offset().top;
	}

	this.touchCeiling = function (boxtop) {
		var ceiling = $("#ceiling");
		return boxtop <= (ceiling.offset().top + ceiling.height());
	}

	this.doNotAllowBirdToFlyHigher = function () {
		this.position = 0;
	}

	this.noPipesYet = function () {
		return pipe_data_container.getPipe(0) == null;
	}

	this.getPipeDimensions = function (nextpipe) {
		var nextpipeupper = nextpipe.children(".pipe_upper");

		var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
	   	var pipeleft = nextpipeupper.offset().left - 2; // for some reason it starts at the inner pipes offset, not the outer pipes.
	   	var piperight = pipeleft + pipe_data_container.getPipeWidth();
	   	var pipebottom = pipetop + pipe_data_container.getPipeHeight();

		return {
			pipetop : pipetop,
			pipeleft : pipeleft,
			piperight : piperight,
			pipebottom : pipebottom
		}
	}

	this.getBoxDimensions = function (box) {

		var origwidth = 34.0;
	 	var origheight = 24.0;

		var boxwidth = origwidth - (Math.sin(Math.abs(this.rotation) / 90) * 8);
		var boxheight = (origheight + box.height) / 2;
		var boxleft = ((box.width - boxwidth) / 2) + box.left;
		var boxtop = ((box.height - boxheight) / 2) + box.top;
		var boxright = boxleft + boxwidth;
		var boxbottom = boxtop + boxheight;

		return {
			boxwidth: boxwidth,
			boxheight: boxheight,
			boxleft: boxleft,
			boxtop: boxtop,
			boxright: boxright,
			boxbottom: boxbottom
		}
	}

	this.didWeCollideWithPipe = function (boxDimensions, pipeDimensions) {
		if (boxDimensions.boxright > pipeDimensions.pipeleft) {
			if (!(boxDimensions.boxtop > pipeDimensions.pipetop && boxDimensions.boxbottom < pipeDimensions.pipebottom)) {
				return true;
			}
		}
	}

	this.didWePassPipe = function (boxleft, pipeDimensions) {
		return boxleft > pipeDimensions.piperight;
	}

	this.die = function(){
		//drop the bird to the floor
	   var playerbottom = $("#"+this.playerId).position().top + $("#"+this.playerId).width(); //we use width because he'll be rotated 90 deg
	   var floor = $("#flyarea").height();
	   var movey = Math.max(0, floor - playerbottom);

	   $("#"+this.playerId).transition({ y: movey + 'px', rotate: 90}, 1000, 'easeInOutCubic');
	}

}