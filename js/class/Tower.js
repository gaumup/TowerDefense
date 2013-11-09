TDVN.Tower = function (type, config) {
    var self = this;

    //private
    var options = {
        speed: 1, //number or firing per second
        damage: 1, //number of creep blood will be decreased
        effect: {
            slow: function (creep, speedDecreasedAmount) { //decreased Creep's speed
                creep.decreaseSpeed(speedDecreasedAmount);
                return true;
            },
            stun: function (creep) { //make Creep stunned
                return true;
            },
            widespread: function (creep) { //damage Creep in a defined area
                return true;
            }
        }, //object
        scope: 1, //area around tower, by grid cell
        multiple: 1 //number of creep that tower can attack at the same time
        //dùng queue để xử lý cho 'multiple', có trạng thái 'lock target' để damage until death or out zone, damage next target if available in zone
    }
    var damageArea = [];
    var lockedTargetUUID = [];
    var targetQueue = [];
    var isFired = false;
    var towerInterval;
    var _startFiring = function () {
        if ( isFired ) { return false; }
        isFired = true;
        towerInterval = setInterval(function () {
            self.pub('towerFired', options.damage, lockedTargetUUID);
        }, Math.round(1000/options.speed));
    }
    var _stopFiring = function () {
        isFired = false;
        if ( towerInterval !== undefined ) { clearInterval(towerInterval); }
    }

    //public
    this.addEffect = function (name, callback) {
        this.options.effect[name] = callback;
    }
    //public getter
    this.getSpeed = function () { return this.options.speed; }
    this.getDamage = function () { return this.options.damage; }
    this.getScope = function () { return this.options.scope; }
    this.getEffect = function () { return this.options.effect; }

    //public setter
    this.setDamageArea = function (x, y) {
        var _fromX = x-options.scope;
        var _toX = x+1+options.scope;
        var _fromY = y-options.scope;
        var _toY = y+1+options.scope;
        for ( var i = _fromX; i <= _toX; i++ ) {
            for ( var j = _fromY; j <= _toY; j++ ) {
                if ( i < x || i > x+1 || j < y || j > y+1 ) {
                    damageArea.push(String(i).concat(j));
                }
            }
        }
    }

    return function () {
        options = $.extend(true, options, config);
        self.obj = $('<div class="Tower '+type+'"></div>');
        self.obj.on('click', function (e) {
            e.stopPropagation();
        });
        var towerRange = $('<div class="TowerRange"></div>');
        self.obj.on('mouseenter', function (e) {
            //alert('Show tower effects list');
            return false;
        });
        self.obj.on('mouseleave', function (e) {
            //alert('Hide tower effects list');
            return false;
        });
        TDVN.Mediator.installTo(self);
        self.sub('creepRunning', function (creep) {
            var x = Math.round(creep.obj.position().left/25)+1;
            var y = Math.round(creep.obj.position().top/25)+1;
            var creepLockedTargetIndex = lockedTargetUUID.indexOf(creep.uuid);
            if ( damageArea.indexOf(String(x).concat(y)) > -1 ) { //creep is in damage area
                //console.log('Hit creep at', String(x).concat(y));
                if ( targetQueue.length < options.multiple && creepLockedTargetIndex == -1 ) {
                    lockedTargetUUID.push(creep.uuid);
                    targetQueue.push(creep);
                }
                _startFiring();
            }
            else { //creep is not in damage area
                if ( creepLockedTargetIndex > -1 ) { //creep already in damage area and escaped :)
                    lockedTargetUUID.splice(creepLockedTargetIndex, 1);
                    targetQueue.splice(creepLockedTargetIndex, 1);
                    if ( targetQueue.length == 0 ) {
                        _stopFiring();
                    }
                }
            }
        });
        self.sub('creepDestroyed', function (creep) {
            var creepLockedTargetIndex = lockedTargetUUID.indexOf(creep.uuid);
            lockedTargetUUID.splice(creepLockedTargetIndex, 1);
            targetQueue.splice(creepLockedTargetIndex, 1);
            if ( targetQueue.length == 0 ) {
                _stopFiring();
            }
        });
    }();
}
TDVN.TowerFactory = {
    define: function (type, config) {
        return window[type] = {
            create: function () {
                return new TDVN.Tower(type, config);
            }
        };
    }
}
