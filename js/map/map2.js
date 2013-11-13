TDVN.MapLoader = {
    config: {
        x: 32,
        y: 16,
        size: 25
    }
}
TDVN.debug = true;

jQuery(document).ready(function () {
    (function ($) {
        var startBtn = $('<button id="startBtn" class="StartBtn">Creep run</button>').appendTo('body');

        //1.MAP -> create a map: 32,16 grid with cell size 25x25
        var mapConfig = TDVN.MapLoader.config;
        var map = new TDVN.Map([mapConfig.x, mapConfig.y], mapConfig.size);
        /*
         * [
         *    1, //left->right then top->down
         *    2, //left->right then bottom->up
         *    3, //right->left then top->down
         *    4, //right->left then bottom->up
         *    5, //top->down then left->right
         *    6, //top->down then right->left
         *    7, //bottom->up then left->right
         *    8, //bottom->up then right->left
         * ]
        */
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
        var route1 = new TDVN.MapRoute({x: 26, y: 14}, 8, 'y', -1);
        var route2 = new TDVN.MapRoute({x: 25, y: 7}, 6, 'x', -1);
        var route3 = new TDVN.MapRoute({x: 18, y: 7}, 5, 'y', 1);
        var route4 = new TDVN.MapRoute({x: 19, y: 12}, 9, 'x', -1);
        var route5 = new TDVN.MapRoute({x: 9, y: 13}, 11, 'y', -1);
        var route6 = new TDVN.MapRoute({x: 8, y: 3}, 6, 'x', -1);
        //add created routes to map
        map.add({ //route 1
            object: route1,
            isRoute: true,
            x: route1.data('x'),
            y: route1.data('y')
        });
        map.add({ //route 2
            object: route2,
            isRoute: true,
            x: route2.data('x'),
            y: route2.data('y')
        });
        map.add({ //route 3
            object: route3,
            isRoute: true,
            x: route3.data('x'),
            y: route3.data('y')
        });
        map.add({ //route 4
            object: route4,
            isRoute: true,
            x: route4.data('x'),
            y: route4.data('y')
        });
        map.add({ //route 5
            object: route5,
            isRoute: true,
            x: route5.data('x'),
            y: route5.data('y')
        });
        map.add({ //route 6
            object: route6,
            isRoute: true,
            x: route6.data('x'),
            y: route6.data('y')
        });

        //2.TOWER PLACEHOLDER -> create some placeholder for tower
        var placholderTower1 = new TDVN.MapTower({x: 24, y: 9});
        var placholderTower2 = new TDVN.MapTower({x: 16, y: 7});
        var placholderTower3 = new TDVN.MapTower({x: 16, y: 14});
        var placholderTower4 = new TDVN.MapTower({x: 9, y: 14});
        var placholderTower5 = new TDVN.MapTower({x: 7, y: 5});
        //add created routes to map
        map.add({ //placeholder tower 1
            object: placholderTower1.obj,
            x: placholderTower1.x,
            y: placholderTower1.y
        });
        map.add({ //placeholder tower 2
            object: placholderTower2.obj,
            x: placholderTower2.x,
            y: placholderTower2.y
        });
        map.add({ //placeholder tower 3
            object: placholderTower3.obj,
            x: placholderTower3.x,
            y: placholderTower3.y
        });
        map.add({ //placeholder tower 4
            object: placholderTower4.obj,
            x: placholderTower4.x,
            y: placholderTower4.y
        });
        map.add({ //placeholder tower 5
            object: placholderTower5.obj,
            x: placholderTower5.x,
            y: placholderTower5.y
        });
        
        //3a.TOWER -> define tower class called 'MagicTower'
        TDVN.TowerFactory.define('MagicTower', {
            speed: 1, //number or firing per second
            damage: 10, //number of creep blood will be decreased
            effect: {},
            scope: 1, //area around tower, by grid cell -> [3x3] around tower
            multiple: 1, //number of creep that tower can attack at the same time
        });
        //init some MagicTower
        var mTower1 = MagicTower.create();
        var mTower2 = MagicTower.create();
        //add some MagicTower to placeholder tower on map
        placholderTower1.build(mTower1);
        placholderTower2.build(mTower2);

        //3b.TOWER -> define tower class called 'IncredibleTower'
        TDVN.TowerFactory.define('IncredibleTower', {
            speed: 5, //number or firing per second
            damage: 50, //number of creep blood will be decreased
            effect: {},
            scope: 2, //area around tower, by grid cell -> [5x5] around tower
            multiple: 1, //number of creep that tower can attack at the same time
        });
        //init some MagicTower
        var mTower3 = IncredibleTower.create();
        //add some MagicTower to placeholder tower on map
        placholderTower3.build(mTower3);

        //4.CREEP
        var route1Data = route1.data();
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
        creepHome = creepHome[2];

        //4a.CREEP -> define some kind of Creep -> NormalCreep
        TDVN.CreepFactory.define('NormalCreep', {
            speed: 1,
            blood: 120,
            shield: 1
        });
        //init some NormalCreep
        var nCreep1 = NormalCreep.create();
        var nCreep2 = NormalCreep.create();
        var nCreep3 = NormalCreep.create();
        var nCreep4 = NormalCreep.create();
        var nCreep5 = NormalCreep.create();
        var nCreep6 = NormalCreep.create();
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
        map.add({ //creep 3
            object: nCreep3.obj,
            x: creepHome[0].x,
            y: creepHome[0].y
        });
        map.add({ //creep 4
            object: nCreep4.obj,
            x: creepHome[1].x,
            y: creepHome[1].y
        });
        map.add({ //creep 5
            object: nCreep5.obj,
            x: creepHome[0].x,
            y: creepHome[0].y
        });
        map.add({ //creep 6
            object: nCreep6.obj,
            x: creepHome[1].x,
            y: creepHome[1].y
        });

        //4b.CREEP -> define some kind of Creep -> SuperCreep
        TDVN.CreepFactory.define('SuperCreep', {
            speed: 2,
            blood: 420,
            shield: 5
        });
        //init some NormalCreep
        var nCreep7 = SuperCreep.create();
        var nCreep8 = SuperCreep.create();
        var nCreep9 = SuperCreep.create();
        var nCreep10 = SuperCreep.create();
        var nCreep11 = SuperCreep.create();
        map.add({ //creep 7
            object: nCreep7.obj,
            x: creepHome[0].x,
            y: creepHome[0].y
        });
        map.add({ //creep 8
            object: nCreep8.obj,
            x: creepHome[1].x,
            y: creepHome[1].y
        });
        map.add({ //creep 9
            object: nCreep9.obj,
            x: creepHome[0].x,
            y: creepHome[0].y
        });
        map.add({ //creep 10
            object: nCreep10.obj,
            x: creepHome[0].x,
            y: creepHome[0].y
        });
        map.add({ //creep 11
            object: nCreep11.obj,
            x: creepHome[0].x,
            y: creepHome[0].y
        });
        
        //5.CREEP -> push created creep into queue
        TDVN.CreepQueue.push(nCreep1);
        TDVN.CreepQueue.push(nCreep2);
        TDVN.CreepQueue.push(nCreep3);
        TDVN.CreepQueue.push(nCreep4);
        TDVN.CreepQueue.push(nCreep7);
        TDVN.CreepQueue.push(nCreep8);
        TDVN.CreepQueue.push(nCreep5);
        TDVN.CreepQueue.push(nCreep6);
        TDVN.CreepQueue.push(nCreep9);
        TDVN.CreepQueue.push(nCreep10);
        TDVN.CreepQueue.push(nCreep11);

        //6. CREEP RUNNING -> start running
        var creepRoute = map.pathToPosition(map.getCreepPath(creepHome), creepHome);
        startBtn.on('click', function (e) {
            startBtn.remove();
            TDVN.CreepQueue.flush(1, function (creeps) {
                $.each(creeps, function (index, creep) {
                    map.bindRoute(creep, creepRoute[index%2 == 0 ? 'rear' : 'inner']);
                    //map.bindRoute(creep, creepRoute['inner']);
                });
            });
        });
    })(jQuery);
});
