function Bird () {
	var playerId="";

	var gravity = 0.25;
	var velocity = 0;
	var position = 180;
	var rotation = 0;
	var jump = -4.6;

	var DEAD = false;
	var ALIVE = true;

	this.score = 0;


	this.reset = function(){
		//set the defaults (again)
	   velocity = 0;
	   position = 180;
	   rotation = 0;
	   score = 0;

	   //update the player in preparation for the next game
	   $("#player"+playerId).css({ y: 0, x: 0});
	   this.updateBird();
	}

	this.jump = function() {
	   velocity = jump;

	   Sounds.playSoundJump();
	}

	this.scored = function (){
	   this.score += 1;
	   //play score sound
	   Sounds.playSoundScore();

	   Score.setBigScore(this.score);
	}

   
   	this.updateBird = function(){

   		var player = $("#player"+playerId);

	   	velocity += gravity;
	   	position += velocity;
  
	   	//rotation
	   	rotation = Math.min((velocity / 10) * 90, 90);
	   
	   	//apply rotation and position
	   	$(player).css({ rotate: rotation, top: position });
	}

	this.checkAlive = function(){
	 	var box = document.getElementById("player"+playerId).getBoundingClientRect();
		
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
		position = 0;
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

		var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
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
	   var playerbottom = $("#player").position().top + $("#player").width(); //we use width because he'll be rotated 90 deg
	   var floor = $("#flyarea").height();
	   var movey = Math.max(0, floor - playerbottom);

	   $("#player").transition({ y: movey + 'px', rotate: 90}, 1000, 'easeInOutCubic');
	}


}