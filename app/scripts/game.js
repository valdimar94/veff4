
window.Game = (function() {
	'use strict';
	var Controls = window.Controls;
	/**
	 * Main game class.
	 * @param {Element} el jQuery element containing the game.
	 * @constructor
	 */
	 var offset = 36;

	var Game = function(el) {
		this.el = el;
		this.SoundManager = new window.SoundManager(this);
		this.player = new window.Player(this.el.find('.Player'), this, this.SoundManager);
		this.score = 0;
		this.highScore = 0;
		this.meme = new window.Memes(this.el.find('.Memes'), this, offset*0);
		this.meme1 = new window.Memes(this.el.find('.Memes1'), this, offset*1);
		this.meme2 = new window.Memes(this.el.find('.Memes2'), this, offset*2);
		this.isPlaying = false;
		// Cache a bound onFrame since we need it each frame.
		this.onFrame = this.onFrame.bind(this);
		document.querySelector('#score').innerHTML = 'Score: ' + this.score;
	};

	/**
	 * Runs every frame. Calculates a delta and allows each game
	 * entity to update itself.
	 */
	Game.prototype.onFrame = function() {
		// Check if the game loop should stop.
		if (!this.isPlaying) {
			return;
		}

		var header = $('.Player');

		var backgrounds = new Array(
    	'url(./images/db1.png)',
			'url(./images/db2.png)',
			'url(./images/db3.png)',
			'url(./images/db4.png)'
		);

		var current = 0;

		function nextBackground() {
    	current++;
    	current = current % backgrounds.length;
    	header.css('background-image', backgrounds[current]);
		}
		setInterval(nextBackground, 100);

		//header.css('background-image', backgrounds[0]);

		if (Controls.isMuted()) {
			this.SoundManager.changeVolume(0);
		}
		else {
			this.SoundManager.changeVolume(1);
		}

		// Calculate how long since last frame in seconds.
		var now = +new Date() / 1000,
				delta = now - this.lastFrame;
		this.lastFrame = now;

		// Update game entities.
		this.player.onFrame(delta);
		this.meme.onFrame(delta);
		this.meme1.onFrame(delta);
		this.meme2.onFrame(delta);

		// Request next frame.
		window.requestAnimationFrame(this.onFrame);
	};

	/**
	 * Starts a new game.
	 */
	Game.prototype.start = function() {
		this.reset();
		// Restart the onFrame loop
		this.lastFrame = +new Date() / 1000;
		window.requestAnimationFrame(this.onFrame);
		this.isPlaying = true;
	};

	/**
	 * Resets the state of the game so a new game can be started.
	 */
	Game.prototype.reset = function() {
		this.score = 0;
		document.querySelector('#score').innerHTML = 'Score: ' + this.score;
		var el = document.getElementById('bgimage');
  	if(el) {
    	el.className = 'GameCanvas MovingBackground';
  	}
		this.SoundManager.gameSound();
		this.player.reset();
		this.meme.reset();
		this.meme1.reset();
		this.meme2.reset();
	};

	/**
	 * Signals that the game is over.
	 */
	Game.prototype.gameover = function() {
		if(this.highScore < this.score) {
			this.highScore = this.score;
		}
		document.querySelector('.score').innerHTML = 'Score: ' + this.score;
		document.querySelector('.highscore').innerHTML = 'High Score: ' + this.highScore;
		var el = document.getElementById('bgimage');
  	if(el) {
    	el.className += el.className + ' PausedBackground';
  	}
		this.isPlaying = false;
		this.SoundManager.menuSound();
		// Should be refactored into a Scoreboard class.
		var that = this;
		var scoreboardEl = this.el.find('.Scoreboard');
		scoreboardEl
			.addClass('is-visible')
			.find('.Scoreboard-restart')
				.one('click', function() {
					scoreboardEl.removeClass('is-visible');
					that.start();
				});
	};

	/**
	 * Some shared constants.
	 */
	Game.prototype.WORLD_WIDTH = 102.4;
	Game.prototype.WORLD_HEIGHT = 57.6;

	return Game;
})();
