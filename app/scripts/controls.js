
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
