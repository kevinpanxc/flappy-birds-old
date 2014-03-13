function Bird () {
	var playerId="";

	var gravity = 0.25;
	var velocity = 0;
	var position = 180;
	var rotation = 0;
	var jump = -4.6;
   
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
		var origwidth = 34.0;
	 	var origheight = 24.0;
	   
		var boxwidth = origwidth - (Math.sin(Math.abs(rotation) / 90) * 8);
		var boxheight = (origheight + box.height) / 2;
		var boxleft = ((box.width - boxwidth) / 2) + box.left;
		var boxtop = ((box.height - boxheight) / 2) + box.top;
		var boxright = boxleft + boxwidth;
		var boxbottom = boxtop + boxheight;
	  
	   	//did we hit the ground?
	   	if(box.bottom >= $("#land").offset().top)
	   	{
	    	return false;
	   	}
	   
	   	//have they tried to escape through the ceiling? :o
	   	var ceiling = $("#ceiling");
	   	if(boxtop <= (ceiling.offset().top + ceiling.height()))
	      	position = 0;


	    //we can't go any further without a pipe
   		if(pipe_data_container.getPipe(0) == null)
      		return;
   
   		//determine the bounding box of the next pipes inner area
   		var nextpipe = pipe_data_container.getPipe(0);
   		var nextpipeupper = nextpipe.children(".pipe_upper");
   
   		var pipetop = nextpipeupper.offset().top + nextpipeupper.height();
   		var pipeleft = nextpipeupper.offset().left - 2; // for some reason it starts at the inner pipes offset, not the outer pipes.
   		var piperight = pipeleft + pipe_data_container.getPipeWidth();
   		var pipebottom = pipetop + pipe_data_container.getPipeHeight();
   

   		//have we gotten inside the pipe yet?
   		if(boxright > pipeleft)
   		{
      		//we're within the pipe, have we passed between upper and lower pipes?
      		if(boxtop > pipetop && boxbottom < pipebottom)
      		{
         		//yeah! we're within bounds
      		}
      		else
      		{
	         	//no! we touched the pipe
	         	return false;
      		}
   		}
   
	   	//have we passed the imminent danger?
	   	if(boxleft > piperight)
	   	{
	      	//yes, remove it
	      	pipe_data_container.removeUsedPipe();
	      
	      	//and score a point
	      	playerScore();
	   	}
	   	return true;
	}


}