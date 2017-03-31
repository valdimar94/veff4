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
