TDVN.Map = function (dimension/*[x,y]*/, size) {
    var self = this;
    var map;
    var xGrid = dimension[0];
    var yGrid = dimension[1];
    var _normalize = function (pos) {
        return {
            x: (pos.x-1)*size,
            y: (pos.y-1)*size
        };
    }
    var routes = [/*{x,y,axis,direction},{x,y,axis,direction}*/]; //position x,y relative to map by number of grid cell

    /*
     * add new object to map
     * config: {
     *     object, //jQuery <div 'route'> object
     *     x, //position x relative to map by number of grid cell
     *     y, //position y relative to map by number of grid cell
     * }
     */
    this.add = function (config) {
        map.append(config.object);
        var pos = _normalize({x: config.x, y: config.y});
        config.object.css({
           left: pos.x,
           top: pos.y
        });
        //if object added is route
        if ( config.isRoute ) {
            var routeData = config.object.data();
            routes.push({
                x: config.x,
                y: config.y,
                axis: routeData.axis,
                direction: routeData.direction
            });
            if ( routeData.axis == 'x' ) {
                routes.push({
                    x: config.x+routeData.length-1,
                    y: config.y,
                    axis: routeData.axis,
                    direction: routeData.direction
                });
                config.object.css({
                    width: routeData.length*size,
                    height: size*2
                });
                if ( routeData.direction < 0 ) {
                    config.object.css({
                       left: '+='+(-(routeData.length-1)*size)
                    });
                }
            }
            else if ( routeData.axis == 'y' ) {
                routes.push({
                    x: config.x,
                    y: config.y+routeData.length-1,
                    axis: routeData.axis,
                    direction: routeData.direction
                });
                config.object.css({
                    width: size*2,
                    height: routeData.length*size
                });
                if ( routeData.direction < 0 ) {
                    config.object.css({
                       top: '+='+(-(routeData.length-1)*size)
                    });
                }
            }
        }
        return config.object;
    }

    /*
     * return {x,y}
     */
    var _getCreepNextCoord_ = function (type/*rear|inner*/, coord, nextCoord) {
        var creepCoord = {};
        if ( type == 'rear' ) {
            if ( coord.axis == 'x' ) {
                if ( coord.y == nextCoord.y || coord.y - nextCoord.y == -1 ) {
                    creepCoord.x = coord.direction > 0 ? nextCoord.x+1 : nextCoord.x;
                }
                else {
                    creepCoord.x = coord.x;
                }
                creepCoord.y = coord.y;
            } 
            else {  //coord.axis =='y'
                creepCoord.x = coord.x;
                if ( coord.x == nextCoord.x || coord.x - nextCoord.x == -1 ) {
                    creepCoord.y = coord.direction > 0 ? nextCoord.y+1 : nextCoord.y;
                }
                else {
                    creepCoord.y = coord.y;
                }
            }
        }
        else { //type == 'inner'
            if ( coord.axis == 'x' ) {
                if ( coord.y == nextCoord.y || coord.y - nextCoord.y == -1 ) {
                    creepCoord.x = coord.direction > 0 ? nextCoord.x : nextCoord.x+1;
                }
                else {
                    creepCoord.x = coord.direction > 0 ? coord.x-1 : coord.x+1;
                }
                creepCoord.y = nextCoord.direction > 0 ? coord.y+1 : coord.y;
            } 
            else {  //coord.axis =='y'
                creepCoord.x = nextCoord.direction > 0 ? coord.x+1 : coord.x;
                if ( coord.x == nextCoord.x || coord.x - nextCoord.x == -1 ) {
                    creepCoord.y = coord.direction > 0 ? nextCoord.y : nextCoord.y+1;
                }
                else {
                    creepCoord.y = coord.direction > 0 ? coord.y-1 : coord.y+1;
                }
            }
        }
        return creepCoord;
    }
    /*
     * return 'rear'|'inner'
     */
    var _getCreepRunType_ = function (creepCurrentType, next1RouteDirection, next2RouteDirection) {
        return next1RouteDirection*next2RouteDirection > 0 
            ? (creepCurrentType == 'rear' ? 'inner' : 'rear')
            : (creepCurrentType == 'rear' ? 'rear' : 'inner');
    }
    
    /*
     * creep -> 'Creep' object
     */
    this.getCreepPath = function (creepHome) {
        var creepRoute = {
            rear: [{x: creepHome[0].x, y: creepHome[0].y}],
            inner: [{x: creepHome[1].x, y: creepHome[1].y}]
        };
        var _creepUtil_ = function (rearType, innerType, r1/*end point*/, r2/*start point of next route to r1*/) {
            //console.log(rearType);
            //console.log(_getCreepNextCoord_(rearType, r1, r2));
            creepRoute.rear.push(_getCreepNextCoord_(rearType, r1, r2));

            //console.log(innerType);
            //console.log(_getCreepNextCoord_(innerType, r1, r2));
            creepRoute.inner.push(_getCreepNextCoord_(innerType, r1, r2));
        }

        //loop throught each route by its 'end {x,y}' point
        for ( var i = 1; i < routes.length; i = i+4 ) {
            var r = routes[i];
            var rearType = 'rear';
            var innerType = 'inner';

            if ( i+1 == routes.length ) {
                //console.log(rearType);
                //console.log({x: r.x, y: r.y});
                //console.log(innerType);
                //console.log(r.axis == 'x' ? {x: r.x, y: r.y+1} : {x: r.x+1, y: r.y});
                return (function() {
                    creepRoute.rear.push({x: r.x, y: r.y});
                    creepRoute.inner.push(r.axis == 'x' ? {x: r.x, y: r.y+1} : {x: r.x+1, y: r.y});
                    return creepRoute;
                })();
            }
            var rNext1 = routes[i+1]; //get 'start' point of next route
            if ( i+3 == routes.length ) {
                return (function() {
                    _creepUtil_(rearType, innerType, r, rNext1);
                    return creepRoute;
                })();
            }
            var rNext1EndPoint = routes[i+2]; //get 'end' point of next route
            var rNext2 = routes[i+3]; //get 'start' point of next-next route
            
            //run on current route
            _creepUtil_(rearType, innerType, r, rNext1);

            //go on the next route, after turning right|left
            rearType = _getCreepRunType_(rearType, rNext1.direction, rNext2.direction);
            innerType = _getCreepRunType_(innerType, rNext1.direction, rNext2.direction);
            _creepUtil_(rearType, innerType, rNext1EndPoint, rNext2);
        }
        return creepRoute;
    }
    /*
     * convert coord {x,y} to {left,top} values in 'px' 
     */
    this.pathToPosition = function (creepRoute, creepHome) {
        //IMPORTANT: TweenLite.bezier.values use 'x', 'y' not the 'left', 'top' value, so we need to re-ajust x, y
        $.each(creepRoute.rear, function () {
            this.x = (this.x-2)*size;
            this.y = (this.y-2)*size;

            var c = $('<div style="width:25px;height:25px;background:#ccc;position:absolute;z-index:2;text-align:center;line-height:25px;">1</div>"');
            c.clone().css({
                left: this.x+1*size,
                top: this.y+1*size
            }).appendTo(map);
        });
        $.each(creepRoute.inner, function () {
            this.x = (this.x-2)*size;
            this.y = (this.y-3)*size;

            var c = $('<div style="width:25px;height:25px;background:#eee;position:absolute;z-index:2;text-align:center;line-height:25px;">2</div>"');
            c.clone().css({
                left: this.x+1*size,
                top: this.y+2*size
            }).appendTo(map);
        });
        return creepRoute;
    }
    /*
     * creep -> 'Creep' object
     */
    this.bindRoute = function (creep, creepRoute) {
        var animQueue = [];
        var delta = 0;
        for ( var i = 0; i < routes.length-1; i++ ) { //calculate total time for a creep run on total routes
            var point1 = routes[i];
            var point2 = routes[i+1];
            var deltaX = point2.x - point1.x;
            var deltaY = point2.y - point1.y;
            delta += deltaX != 0 ? deltaX : deltaY;
        }
        //console.log(creepRoute);
        //return false;
        TweenLite.to(creep.obj, delta/creep.getProps('speed'), {
            bezier: {
                curviness: 0,
                timeResolution: 20,
                values: creepRoute,
                autoRotate: true
            },
            ease: Linear.easeNone,
            onUpdate: function () {
                creep.pub('creepRunning', creep);
            }
        });
    }

    return function () {
        map = $('<div id="tdvnMap"></div>');
        $('body').append(map);
        map.css({
            width: xGrid*size,
            height: yGrid*size
        });
        self.obj = map;
    }();
}

TDVN.MapRoute = function (startPoint/*object{x,y}*/, length, axis/*String x|y*/, direction) {
    var route = $('<div class="MapRoute"></div>');
    route.data({
        x: startPoint.x,
        y: startPoint.y,
        length: length,
        axis: axis,
        direction: direction
    });
    return route;
}

TDVN.MapTower = function (config) {
    var self = this;
    
    this.build = function (tower) {
        self.obj.html(tower.obj);
        tower.setDamageArea(config.x, config.y);
    }

    return function () {
        self.obj = $('<div class="MapTower"></div>');
        self.x = config.x;
        self.y = config.y;

        self.obj.on('click', function (e) {
            alert('Show popup for user to choose tower');
            return false;
        });
    }();
}