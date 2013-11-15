TDVN.Creep = function (type, config) {
    var self = this;
	
	//private
	var aBlood = 0;
	var bBlood = 0;
    var options = {
        type: '',
        speed: 0, //number of grid creep can move in a second
        blood: 0, //number
        shield: 0 //number
    }
    
    //public
	this.uuid = new TDVN.Algorithm.UUID;
    this.decreaseSpeed = function (amount) {
        this.speed -= amount;
    }

    this.getProps = function (name) { return name === undefined ? options : options[name]; }

    return function () {
        options = $.extend(true, options, config);
		self.obj = $('<div class="Hidden Creep '+type+'"><span class="Char"><em class="Blood">'+options.blood+'</em></span></div>');
		aBlood = options.blood;
		bBlood = parseInt(self.obj.find('.Blood').css('width'));
        TDVN.Mediator.installTo(self);
        self.sub('towerFired', function (damage, lockedTargetUUID) {
            if ( lockedTargetUUID.indexOf(self.uuid) > -1 && options.blood > 0 ) {
                if ( damage <= options.shield ) { return false; }
                //console.log('Creep', self.obj.text(), '\'s blood decreased by', damage - options.shield);
                options.blood -= (damage - options.shield);
				self.obj.find('.Blood').css('width', options.blood*bBlood/aBlood);
                if ( options.blood <= 0 ) {
                    self.pub('creepDestroyed', self);
					TweenLite.killTweensOf(self.obj);
                    self.obj.addClass('Die');
					setTimeout(function(){
						self.obj.remove();
					}, 300);
                }
            }
        });
    }();
}
TDVN.CreepFactory = {
    define: function (type, config) {
        return window[type] = {
            create: function () {
                return new TDVN.Creep(type, config);
            }
        };
    }
}

TDVN.CreepQueue = { //First-In-First-Out
    queue: [],

    pop: function () { //pop 2 creeps at a time, even is 'rear', odd is 'inner'
        if ( this.queue.length == 0 ) { return false; }
        var creep1 = this.queue.shift();
        var creep2 = this.queue.shift();
        return creep2 === undefined ? [creep1] : [creep1, creep2];
    },

    push: function (creep) {
        this.queue.push(creep);
    },

    flush: function (delay, callback) {
        var self = this;
        var _flushCreep_ = function () {
            var creeps = self.pop();
            if ( !creeps ) {
                if ( intv !== undefined ) { clearInterval(intv); }
                return true;
            }
            callback(creeps);
        }
        _flushCreep_(); //run immediately for 1st time, then loop by the interval

        delay = delay || 2; //in second
        var intv = setInterval(function () {
            _flushCreep_();
        }, delay*1000);
    }
}
