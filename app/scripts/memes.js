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
