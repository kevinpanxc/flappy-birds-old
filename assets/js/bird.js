function Bird (player_id, username, is_main_client, velocity, y_position, rotation) {
	// var gravity = 0;
	// var jump = 0;

	var gravity = 0.25;
	var jump = -4.6;

	var DEAD = false;
	var ALIVE = true;

	this.player_id = player_id;
	this.username = username;
	this.velocity = velocity;
	this.y_position = y_position;
	this.rotation = rotation;
	this.score = 0;
	this.is_dead = false;
	this.is_main_client = is_main_client;

	this.reset = function(){
		this.is_dead = false;

		//set the defaults (again)
		this.velocity = 0;
		this.y_position = 180;
		this.rotation = 0;
		this.score = 0;

		this.add_to_fly_area(0);

		//update the player in preparation for the next game
		this.update_bird();
	}
	
	this.add_to_fly_area = function(time_diff){		
		var player = $("#"+this.player_id);
		if (player) player.remove();

	   	var birds_container = document.getElementById("birds");
	   	var new_bird = document.createElement("div");
	   	new_bird.className = "bird bird-flapping-wings animated";
	   	new_bird.id = this.player_id;
	   	if (!this.is_main_client) new_bird.style.opacity = "0.5";
	   	birds_container.appendChild(new_bird);

	   	$(new_bird).css({ x: 60 + time_diff * 0.1333, top: this.y_position});		
	}

	this.remove = function () {
		var player = $("#"+this.player_id);
		if (player) player.remove();
	}

	this.jump = function() {
		this.velocity = jump;
		Sounds.play_jump();
	}

	this.scored = function (){
	   this.score += 1;
	   Sounds.play_score();
	   Score.display_big_score(this.score);
	}

   	this.update_bird = function(){
   		var player = $("#"+this.player_id);

	   	this.velocity += gravity;
	   	this.y_position += this.velocity;

	   	//rotation
	   	this.rotation = Math.min((this.velocity / 10) * 90, 90);
	   
	   	//apply rotation and y_position
	   	$(player).css({ rotate: this.rotation, top: this.y_position });
	}

	this.check_alive = function(){
	 	var box = document.getElementById(this.player_id).getBoundingClientRect();
		
		var box_dimensions = this.get_box_dimensions(box);
	  
	   	if(this.touch_ground(box)) return DEAD;
	   
	   	if(this.touch_ceiling(box_dimensions.box_top)) this.do_not_allow_bird_to_fly_higher();

   		if(this.no_pipes_yet()) {
   			return ALIVE;
   		} else {
	   		var next_pipe = Pipes.get_pipe(0);

	   		var pipe_dimensions = this.get_pipe_dimensions(next_pipe);
	   
	   		if(this.did_we_collide_with_pipe(box_dimensions, pipe_dimensions)) return DEAD;
	   
		   	if(this.did_we_pass_pipe(box_dimensions.box_left, pipe_dimensions)) {
		      	Pipes.remove_used_pipe();
		      
		      	this.scored();
		   	}
		   	return ALIVE;
   		}
	}

	this.touch_ground = function (box) {
		return box.bottom >= $("#land").offset().top;
	}

	this.touch_ceiling = function (box_top) {
		var ceiling = $("#ceiling");
		return box_top <= (ceiling.offset().top + ceiling.height());
	}

	this.do_not_allow_bird_to_fly_higher = function () {
		this.y_position = 0;
	}

	this.no_pipes_yet = function () {
		return Pipes.get_pipe(0) == null;
	}

	this.get_pipe_dimensions = function (next_pipe) {
		var next_upper_pipe = next_pipe.children(".pipe_upper");

		var pipe_top = next_upper_pipe.offset().top + next_upper_pipe.height();
	   	var pipe_left = next_upper_pipe.offset().left - 2; // for some reason it starts at the inner pipes offset, not the outer pipes.
	   	var pipe_right = pipe_left + Pipes.get_pipe_width();
	   	var pipe_bottom = pipe_top + Pipes.get_pipe_height();

		return {
			pipe_top : pipe_top,
			pipe_left : pipe_left,
			pipe_right : pipe_right,
			pipe_bottom : pipe_bottom
		}
	}

	this.get_box_dimensions = function (box) {

		var orig_width = 34.0;
	 	var orig_height = 24.0;

		var box_width = orig_width - (Math.sin(Math.abs(this.rotation) / 90) * 8);
		var box_height = (orig_height + box.height) / 2;
		var box_left = ((box.width - box_width) / 2) + box.left;
		var box_top = ((box.height - box_height) / 2) + box.top;
		var box_right = box_left + box_width;
		var box_bottom = box_top + box_height;

		return {
			box_width: box_width,
			box_height: box_height,
			box_left: box_left,
			box_top: box_top,
			box_right: box_right,
			box_bottom: box_bottom
		}
	}

	this.did_we_collide_with_pipe = function (box_dimensions, pipe_dimensions) {
		if (box_dimensions.box_right > pipe_dimensions.pipe_left) {
			if (!(box_dimensions.box_top > pipe_dimensions.pipe_top && box_dimensions.box_bottom < pipe_dimensions.pipe_bottom)) {
				return true;
			}
		}
	}

	this.did_we_pass_pipe = function (box_left, pipe_dimensions) {
		return box_left > pipe_dimensions.pipe_right;
	}

	this.die = function(){
		this.is_dead = true;

		//drop the bird to the floor
		var player_bottom = $("#"+this.player_id).position().top + $("#"+this.player_id).width(); //we use width because he'll be rotated 90 deg
		var floor = $("#flyarea").height();
		var movey = Math.max(0, floor - player_bottom);

		$("#"+this.player_id).transition({ y: movey + 'px', rotate: 90}, 1000, 'easeInOutCubic');
	}
}