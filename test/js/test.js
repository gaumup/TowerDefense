jQuery(document).ready(function () {
    (function ($) {
        var testcaseID = window.location.search.substr(1) || 1;
        var testcases = $('#testcases');
        var testcaseLnk = $('<li><a href="" title=""></a>');
        for ( var i = 0; i < TDVN.Testcase.route.length; i++ ) {
            var clone = testcaseLnk.clone();
            testcases.append(clone);
            clone.find('a').eq(0).attr('href', 'index.html?'+(i+1)).text((i+1));
            if ( testcaseID == i+1 ) { clone.addClass('Active'); }
        }

        //1.MAP -> create a map: 32,16 grid with cell size 25x25
        var mapConfig = TDVN.MapLoader.config;
        var map = new TDVN.Map([mapConfig.x, mapConfig.y], mapConfig.size);

        var routeTestcase = TDVN.Testcase.route[testcaseID-1];
        //for debug only, show map grid guides
        var cell = $('<div class="GridCell"></div>');
        var j = 0;
        for ( var i = 0; i < mapConfig.x*mapConfig.y; i++ ) {
            var _cell_ = cell.clone().css({width:mapConfig.size, height:mapConfig.size});
            if ( i >= 0 && i < mapConfig.x ) { _cell_.text(i+1); }
            if ( i-(j*mapConfig.x) == 0 ) { _cell_.text(++j); }
            map.obj.append(_cell_); 
        }

        //**ROUTE -> create some routes
        //new TDVN.MapRuute(startPoint/*object{x,y}*/, length, axis/*String x|y*/, direction)
        $.each(routeTestcase.routes, function (index, config) {
            var _route_ = new TDVN.MapRoute(config[0], config[1], config[2], config[3]);
            //add created routes to map
            map.add({ //route 6
                object: _route_,
                isRoute: true,
                x: _route_.data('x'),
                y: _route_.data('y')
            });
        });

        //4.CREEP
        var route1Data = routeTestcase.routes[0][0];
        route1Data.axis = routeTestcase.routes[0][2];
        //creepHome: 0 -> rear, 1 -> inner
        /*
         * == 1 route only, rear or inner is not important
         *    0, //for all cases
         * >= 2 routes, if the 2nd route is:
         *    1, //y then left->right
         *    2, //y then right->left
         *    3, //x then top->down
         *    4, //x then bottom->up
         */
        var creepHome = [
            [
                {x: route1Data.x, y: route1Data.y},
                {
                    x: route1Data.x + (route1Data.axis == 'y' ? 1 : 0),
                    y: route1Data.y + (route1Data.axis == 'x' ? 1 : 0)
                }
            ], //0
            [{x: route1Data.x, y: route1Data.y}, {x: route1Data.x+1, y: route1Data.y}], //1
            [{x: route1Data.x+1, y: route1Data.y}, {x: route1Data.x, y: route1Data.y}], //2
            [{x: route1Data.x, y: route1Data.y}, {x: route1Data.x, y: route1Data.y+1}], //3
            [{x: route1Data.x, y: route1Data.y+1}, {x: route1Data.x, y: route1Data.y}] //4
        ]
        creepHome = creepHome[routeTestcase.mapFlow];

        //4a.CREEP -> define some kind of Creep -> NormalCreep
        TDVN.CreepFactory.define('NormalCreep', {
            speed: 1,
            blood: 120,
            shield: 1
        });
        //init some NormalCreep
        var nCreep1 = NormalCreep.create();
        var nCreep2 = NormalCreep.create();
        map.add({ //creep 1
            object: nCreep1.obj,
            x: creepHome[0].x,
            y: creepHome[0].y
        });
        map.add({ //creep 2
            object: nCreep2.obj,
            x: creepHome[1].x,
            y: creepHome[1].y
        });
        TDVN.CreepQueue.push(nCreep1);
        TDVN.CreepQueue.push(nCreep2);
        //6. CREEP -> start running
        var creepRoute = map.pathToPosition(map.getCreepPath(creepHome), creepHome);
        TDVN.CreepQueue.flush(1, function (creeps) {
            $.each(creeps, function (index, creep) {
                map.bindRoute(creep, creepRoute[index%2 == 0 ? 'rear' : 'inner']);
            });
        });
    })(jQuery);
});
