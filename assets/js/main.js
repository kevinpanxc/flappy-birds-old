/*
   Copyright 2014 Nebez Briefkani
   floppybird - main.js

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var states = Object.freeze({
   SplashScreen: 0,
   GameScreen: 1,
   ScoreScreen: 2,
   WaitingForServer: 3
});

var currentstate;

var bird;

var birdArray = {};

var highscore = 0;
var replayclickable = false;

//loops
var loopGameloop;
var loopPipeloop;

var socket;

$(document).ready(function() {
   if(window.location.search == "?easy")
      pipe_data_container.setEasyMode();
   
   //get the highscore
   var savedscore = getCookie("highscore");
   if(savedscore != "")
      highscore = parseInt(savedscore);

   currentstate = states.WaitingForServer;

   var url = 'http://192.168.101.31:3700'
   socket = io.connect(url);

   socket.on('register-response', function(data) {
      bird = new Bird(0,180,0,data);
      showSplash();
      bird.reset();

      currentstate = states.SplashScreen;
   });

   socket.on('pipe-response', function(data) {
      var newpipe = $('<div class="pipe animated"><div class="pipe_upper" style="height: ' + data.topheight + 'px;"></div><div class="pipe_lower" style="height: ' + data.bottomheight + 'px;"></div></div>');
      $("#flyarea").append(newpipe);
      pipe_data_container.pushPipe(newpipe);
   });

   socket.on('bird-jumped',function(data){
      if (data !== bird.playerId) birdArray[data].jump();
   });

   socket.on('sync-response',function(data){
      birdArray = {};
      for (client in data) {
         addBird(data[client]);
      }
   });

   socket.on('bird-death-response', function(data){
      if (data !== bird.playerId) birdArray[data].die();
   });

   background_animation.endAnimations();
   
});

function addBird(data) {
   var bird = new Bird(data.velocity, data.position, data.rotation, data.clientId);
   bird.addToFlyArea(data.timediff);
   birdArray[data.clientId] = bird;
}

function getCookie(cname)
{
   var name = cname + "=";
   var ca = document.cookie.split(';');
   for(var i=0; i<ca.length; i++) 
   {
      var c = ca[i].trim();
      if (c.indexOf(name)==0) return c.substring(name.length,c.length);
   }
   return "";
}

function setCookie(cname,cvalue,exdays)
{
   var d = new Date();
   d.setTime(d.getTime()+(exdays*24*60*60*1000));
   var expires = "expires="+d.toGMTString();
   document.cookie = cname + "=" + cvalue + "; " + expires;
}

function showSplash() {
   currentstate = states.SplashScreen;
   
   bird.reset();
   
   Sounds.playSoundSwoosh();
   
   //clear out all the pipes if there are any
   $(".pipe").remove();
   pipe_data_container.clearPipes();
   
   //fade in the splash
   $("#splash").transition({ opacity: 1 }, 2000, 'ease');

}

function startGame() {
   background_animation.startAnimations();
   currentstate = states.GameScreen;

   socket.emit('register-request', null);
   socket.emit('sync-request', bird.playerId);
   
   //fade out the splash
   $("#splash").stop();
   $("#splash").transition({ opacity: 0 }, 500, 'ease');
   
   //update the big score
   Score.setBigScore(bird.score);

   //start up our loops
   var updaterate = 1000.0 / 60.0 ; //60 times a second
   loopGameloop = setInterval(gameloop, updaterate);
   loopPipeloop = setInterval(updatePipes, 1400);
   
   //jump from the start!
   bird.jump();
}


function gameloop() { 
   bird.updateBird();
   updateAllBirds();
   if (!bird.checkAlive()){
      killBird();
   }

}

function updateAllBirds() {
   for (var bird in birdArray) {
      birdArray[bird].updateBird();
   }
}

//Handle space bar
$(document).keydown(function(e){
   //space bar!
   if(e.keyCode == 32)
   {
      //in ScoreScreen, hitting space should click the "replay" button. else it's just a regular spacebar hit
      if(currentstate == states.ScoreScreen)
         $("#replay").click();
      else
         screenClick();
   }
});

//Handle mouse down OR touch start
if("ontouchstart" in window)
   $(document).on("touchstart", screenClick);
else
   $(document).on("mousedown", screenClick);

function screenClick()
{
   if(currentstate == states.GameScreen)
   {
      socket.emit('bird-jump',bird.playerId);
      bird.jump();
   }
   else if(currentstate == states.SplashScreen)
   {
      startGame();
   }
}

function setMedal()
{
   var elemmedal = $("#medal");
   elemmedal.empty();
   
   if(bird.score < 10)
      //signal that no medal has been won
      return false;
   
   if(bird.score >= 10)
      medal = "bronze";
   if(bird.score >= 20)
      medal = "silver";
   if(bird.score >= 30)
      medal = "gold";
   if(bird.score >= 40)
      medal = "platinum";
   
   elemmedal.append('<img src="images/medal_' + medal +'.png" alt="' + medal +'">');
   
   //signal that a medal has been won
   return true;
}

function killBird() {
   bird.die();
   socket.emit('bird-death-request',bird.playerId);
   //stop animating everything!
   background_animation.endAnimations();

   //it's time to change states. as of now we're considered ScoreScreen to disable left click/flying
   currentstate = states.ScoreScreen;

   //destroy our gameloops
   clearInterval(loopGameloop);
   clearInterval(loopPipeloop);
   loopGameloop = null;
   loopPipeloop = null;

   pipe_data_container.resetIndex();

   //mobile browsers don't support buzz bindOnce event
   if(isIncompatible.any())
   {
      //skip right to showing score
      showScore();
   }
   else
   {
      //play the hit sound (then the dead sound) and then show score
      Sounds.playSoundHit().bindOnce("ended", function() {
         Sounds.playSoundDie().bindOnce("ended", function() {
            showScore();
         });
      });
   }
}

function showScore()
{
   //unhide us
   $("#scoreboard").css("display", "block");
   
   //remove the big score
   Score.removeBigScore();
   
   //have they beaten their high score?
   if(bird.score > highscore)
   {
      //yeah!
      highscore = bird.score;
      //save it!
      setCookie("highscore", highscore, 999);
   }
   
   //update the scoreboard
   Score.setSmallScore(bird.score);

   Score.setHighScore(bird.score);

   var wonmedal = setMedal();
   
   Sounds.playSoundSwoosh();
   
   //show the scoreboard
   $("#scoreboard").css({ y: '40px', opacity: 0 }); //move it down so we can slide it up
   $("#replay").css({ y: '40px', opacity: 0 });
   $("#scoreboard").transition({ y: '0px', opacity: 1}, 600, 'ease', function() {
      //When the animation is done, animate in the replay button and SWOOSH!
      Sounds.playSoundSwoosh();

      $("#replay").transition({ y: '0px', opacity: 1}, 600, 'ease');
      
      //also animate in the MEDAL! WOO!
      if(wonmedal)
      {
         $("#medal").css({ scale: 2, opacity: 0 });
         $("#medal").transition({ opacity: 1, scale: 1 }, 1200, 'ease');
      }
   });

   //make the replay button clickable
   replayclickable = true;
}

$("#replay").click(function() {
   //make sure we can only click once
   if(!replayclickable)
      return;
   else
      replayclickable = false;

   Sounds.playSoundSwoosh();
   
   //fade out the scoreboard
   $("#scoreboard").transition({ y: '-40px', opacity: 0}, 1000, 'ease', function() {
      //when that's done, display us back to nothing
      $("#scoreboard").css("display", "none");
      
      //start the game over!
      showSplash();
   });
});


function updatePipes()
{
   //Do any pipes need removal?
   $(".pipe").filter(function() { return $(this).position().left <= -100; }).remove()

   socket.emit('pipe-request', {
      index: pipe_data_container.getAndIncrementPipeIndex()
   });
}

var isIncompatible = {
   Android: function() {
   return navigator.userAgent.match(/Android/i);
   },
   BlackBerry: function() {
   return navigator.userAgent.match(/BlackBerry/i);
   },
   iOS: function() {
   return navigator.userAgent.match(/iPhone|iPad|iPod/i);
   },
   Opera: function() {
   return navigator.userAgent.match(/Opera Mini/i);
   },
   Safari: function() {
   return (navigator.userAgent.match(/OS X.*Safari/) && ! navigator.userAgent.match(/Chrome/));
   },
   Windows: function() {
   return navigator.userAgent.match(/IEMobile/i);
   },
   any: function() {
   return (isIncompatible.Android() || isIncompatible.BlackBerry() || isIncompatible.iOS() || isIncompatible.Opera() || isIncompatible.Safari() || isIncompatible.Windows());
   }
};