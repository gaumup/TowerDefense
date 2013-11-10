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
        var bullet = $('<div class="Bullet"></div>');
        var towerPos = self.obj.offset();
        var _firingFunc_ = function () {
            $.each(targetQueue, function (index, creep) {
                var creepPos = creep.obj.offset();
                var creepAjustment = {x: Math.round(creep.obj.width()/2), y: Math.round(creep.obj.height()/2)};
                var clonedBullet = bullet.clone();
                clonedBullet.appendTo('body').css({
                    top: towerPos.top + TDVN.MapLoader.config.size - 1,
                    left: towerPos.left + TDVN.MapLoader.config.size - 1,
                });
                TweenLite.to(
                    clonedBullet, 
                    0.1, 
                    {
                        left: creepPos.left + creepAjustment.x,
                        top: creepPos.top + creepAjustment.y,
                        onComplete: function () {
                            //publish 'fired' at creep
                            self.pub('towerFired', options.damage, lockedTargetUUID);
                            creep.obj.append(clonedBullet.css({
                                left: creepAjustment.x,
                                top: creepAjustment.y
                            }));
                            setTimeout(function () {
                                clonedBullet.remove();
                            }, 500);
                        }
                    }
                );
            });
        }
        //fire for 1st time, then loop in the interval
        _firingFunc_();
        towerInterval = setInterval(function () {
            _firingFunc_();
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
            //alert('Show|Hide tower effects list');
            e.stopPropagation();
        });
        var towerRange = $('<div class="TowerRange"></div>');
        TDVN.Mediator.installTo(self);
        self.sub('creepRunning', function (creep) {
            var x = Math.round(creep.obj.position().left/TDVN.MapLoader.config.size)+1;
            var y = Math.round(creep.obj.position().top/TDVN.MapLoader.config.size)+1;
            var creepLockedTargetIndex = lockedTargetUUID.indexOf(creep.uuid);
            if ( damageArea.indexOf(String(x).concat(y)) > -1 ) { //creep is in damage area
                //console.log('Hit creep at', String(x).concat(y));
                if ( targetQueue.length < options.multiple && creepLockedTargetIndex == -1 ) {
                    lockedTargetUUID.push(creep.uuid);
                    targetQueue.push(creep);
                }
                if ( targetQueue.length > 0 ) {
                    _startFiring();
                }
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
