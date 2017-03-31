window.Player = (function() {
	'use strict';

	var Controls = window.Controls;

	// All these constants are in em's, multiply by 10 pixels
	// for 1024x576px canvas.
	var WIDTH = 5;
	var HEIGHT = 5;
	var INITIAL_POSITION_X = 20;
	var INITIAL_POSITION_Y = 25;

	var FALL_RATE = 200;
	var JUMP_LENGTH = 0.2;

	var Player = function(el, game, sm) {
		this.el = el;
		this.game = game;
		this.pos = { x: 0, y: 0 };
		this.soundManager = sm;

		this.jumping = false;
		this.jumpTime = null;
		this.fallingSpeed = 0;
		this.rotation = 0;
	};

	/**
	 * Resets the state of the player for a new game.
	 */
	Player.prototype.reset = function() {
		this.pos.x = INITIAL_POSITION_X;
		this.pos.y = INITIAL_POSITION_Y;
		this.rotation = 0;
		this.fallingSpeed = 0;
		this.jumping = false;
		this.jumpTime = null;
	};

	Player.prototype.onFrame = function(delta) {

		// Get the jump signal from Controls
		if (Controls.didJump()) {
			this.soundManager.flapSound();
			this.jumping = true;
			this.jumpTime = new Date() / 1000;

			this.fallingSpeed = - (FALL_RATE / 4);
			this.rotation = -20;
		} else {
			var t = new Date() / 1000;
			if(t - this.jumpTime > 0.2) {
				this.rotation = 0;
			}
		}



		this.pos.y += delta * this.fallingSpeed;
		this.fallingSpeed += delta * FALL_RATE;
		if(this.fallingSpeed > 60) {
			this.rotation = 55;
		} else if(this.fallingSpeed > 50) {
				this.rotation = 48;
		} else if (this.fallingSpeed > 40) {
			this.rotation = 40;
		} else if(this.fallingSpeed > 30) {
			this.rotation = 30;
		} else if (this.fallingSpeed > 20) {
			this.rotation = 20;
		}
		this.checkCollisionWithBounds();

		// Update UI
		this.el.css('transform', 'translateZ(0) translate(' + this.pos.x + 'em, ' + this.pos.y + 'em) rotate(' + this.rotation + 'deg)');
	};

	Player.prototype.checkCollisionWithBounds = function() {
		if (this.pos.x < 0 ||
			this.pos.x + WIDTH > this.game.WORLD_WIDTH ||
			this.pos.y < 0 ||
			this.pos.y + HEIGHT > this.game.WORLD_HEIGHT ||
		  this.normie()) {
			return this.game.gameover();
		} else if (this.escapedMemes()) {
			this.game.score++;
			document.querySelector('#score').innerHTML = 'Score: ' + this.game.score;
		}
	};

	Player.prototype.normie = function() {
		return (this.pos.x > this.game.meme.pos.x && this.pos.x < this.game.meme.pos.x + 9
						&& ((this.pos.y < this.game.meme.pos.y + 37) || (this.pos.y > this.game.meme.pos.y + 50))) ||
						(this.pos.x > this.game.meme1.pos.x && this.pos.x < this.game.meme1.pos.x + 9
						&& ((this.pos.y < this.game.meme1.pos.y + 37) || (this.pos.y > this.game.meme1.pos.y + 50))) ||
						(this.pos.x > this.game.meme2.pos.x && this.pos.x < this.game.meme2.pos.x + 9
						&& ((this.pos.y < this.game.meme2.pos.y + 37) || (this.pos.y > this.game.meme2.pos.y + 50)));
	};

	Player.prototype.escapedMemes = function() {
		return (this.pos.x > this.game.meme.pos.x + 9 && this.pos.x < this.game.meme.pos.x + 10) ||
					 (this.pos.x > this.game.meme1.pos.x + 9 && this.pos.x < this.game.meme1.pos.x + 10) ||
					 (this.pos.x > this.game.meme2.pos.x + 9 && this.pos.x < this.game.meme2.pos.x + 10);
	}

	return Player;

})();
