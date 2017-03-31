
/**
 * Bootstrap and start the game.
 */
$(function() {
    'use strict';

    var game = new window.Game($('.GameCanvas'));
    game.start();
});


window.Controls = (function() {
    'use strict';

    /**
     * Key codes we're interested in.
     */
    var KEYS = {
        32: 'space',
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        77: 'm'
    };

    /**
     * A singleton class which abstracts all player input,
     * should hide complexity of dealing with keyboard, mouse
     * and touch devices.
     * @constructor
     */
    var Controls = function() {
        this._didJump = false;
        this._muteSounds = false;
        this.keys = {};
        $(window)
            .on('keydown', this._onKeyDown.bind(this))
            .on('keyup', this._onKeyUp.bind(this))
            .on('click', this._onKeyDown.bind(this));
    };

    Controls.prototype._onKeyDown = function(e) {
        // Only jump if space wasn't pressed.
        if ((e.keyCode === 32 && !this.keys.space) || e.type === "click") {
            this._didJump = true;
        }
        if (e.keyCode === 77) {
            if(!this._muteSounds){
                this._muteSounds = true;
            }
            else {
                this._muteSounds = false;
            }
        }

        // Remember that this button is down.

        if (e.keyCode in KEYS) {
            var keyName = KEYS[e.keyCode];
            this.keys[keyName] = true;
            return false;
        }
    };

    Controls.prototype._onKeyUp = function(e) {
        if (e.keyCode in KEYS) {

            var stuff = document.querySelector("#playerID");
            stuff.className = "Player";
            var keyName = KEYS[e.keyCode];
            this.keys[keyName] = false;
            return false;
        }
    };

    /**
     * Only answers true once until a key is pressed again.
     */
    Controls.prototype.didJump = function() {
        var answer = this._didJump;
        this._didJump = false;
        return answer;
    };
    Controls.prototype.isMuted = function() {
        return this._muteSounds;
    };

    // Export singleton.
    return new Controls();
})();


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

/**
 * Cross browser RequestAnimationFrame
 */
if (!window.requestAnimationFrame) {
    window.requestAnimationFrame = (function() {
        'use strict';
        return window.requestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.oRequestAnimationFrame ||
            window.msRequestAnimationFrame ||
            function(/* function */ callback) {
                window.setTimeout(callback, 1000 / 60);
            };
    })();
}

window.Memes = (function() {
	'use strict';

  var SPEED = 30;
	var INITIAL_POSITION_X = 102;
	var INITIAL_POSITION_Y = 0;

	var Memes = function(el, game, offsetX) {
    this.el = el;
    this.game = game;
    this.offset = offsetX;
    this.pos = {x: INITIAL_POSITION_X, y: INITIAL_POSITION_Y};
	};


	/**
	 * Resets the state of the player for a new game.
	 */
	Memes.prototype.reset = function() {
		this.pos.x = INITIAL_POSITION_X + this.offset;
    this.pos.y = Math.floor(Math.random() * - 35);
	};

  Memes.prototype.onFrame = function(delta) {
    this.pos.x -= delta * SPEED + 0.25;

    if (this.pos.x < -10) {
  		this.pos.x = INITIAL_POSITION_X;
      this.pos.y = Math.floor((Math.random() * -35));
    }

		this.el.css('transform', 'translateZ(0) translate(' + this.pos.x + 'em, ' + this.pos.y + 'em)');
  };

	return Memes;

})();

window.SoundManager = (function() {
	'use strict';

	var SoundManager = function(game) {
    this.game = game;
		this.volume = 1;
		this.gameSoundtrack = document.createElement('audio');
		this.toastyWhoopsie = document.createElement('audio');
		this.wrongNeighborhood = document.createElement('audio');
		this.flapSoundEffect = document.createElement('audio');

	};

	SoundManager.prototype.gameSound = function() {
		this.gameSoundtrack.src = '../sounds/spongebobu.mp3';
		this.wrongNeighborhood.pause();
		if (this.gameSoundtrack.readyState !== 4) {
    	this.gameSoundtrack.load();
		}
		this.gameSoundtrack.play();
	};

	SoundManager.prototype.flapSound = function() {
		this.flapSoundEffect.src = '../sounds/fart.wav';
		if (this.flapSoundEffect.readyState !== 4) {
    	this.flapSoundEffect.load();
		}
		this.flapSoundEffect.play();
	};

	SoundManager.prototype.menuSound = function() {
		this.toastyWhoopsie.src = '../sounds/toasty.mp3';
		this.gameSoundtrack.pause();
		if (this.toastyWhoopsie.readyState !== 4) {
    	this.toastyWhoopsie.load();
		}
		this.toastyWhoopsie.play();
		this.wrongNeighborhood.src = '../sounds/wrong.mp3';
		if (this.wrongNeighborhood.readyState !== 4) {
    	this.wrongNeighborhood.load();
		}
		this.wrongNeighborhood.play();
	};

	SoundManager.prototype.changeVolume = function(newVol) {
		this.volume = newVol;
		this.gameSoundtrack.volume = this.volume;
		this.wrongNeighborhood.volume = this.volume;
		this.toastyWhoopsie.volume = this.volume;
		this.flapSoundEffect.volume = this.volume;
	};

	return SoundManager;

})();
