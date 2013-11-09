jQuery(document).ready(function () {
    (function ($) {
        var startBtn = $('<button id="startBtn">Creep run</button>').appendTo('body');

        //1.MAP -> create a map: 32,16 grid with cell size 25x25
        var mapConfig = {
            x: 32,
            y: 16,
            size: 25
        };
        var map = new TDVN.Map([mapConfig.x, mapConfig.y], mapConfig.size);
        var mapFlow = 1; //1: left->right, 2: top->down, 3: right->left, 4: bottom->up
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
        var route1 = new TDVN.MapRoute({x: 2, y: 2}, 13, 'x', 1);
        var route2 = new TDVN.MapRoute({x: 15, y: 2}, 6, 'y', 1);
        var route3 = new TDVN.MapRoute({x: 17, y: 6}, 8, 'x', 1);
        var route4 = new TDVN.MapRoute({x: 25, y: 6}, 8, 'y', 1);
        var route5 = new TDVN.MapRoute({x: 27, y: 12}, 4, 'x', 1);
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

        //2.TOWER PLACEHOLDER -> create some placeholder for tower
        var placholderTower1 = new TDVN.MapTower({x: 13, y: 4});
        var placholderTower2 = new TDVN.MapTower({x: 17, y: 2});
        var placholderTower3 = new TDVN.MapTower({x: 17, y: 8});
        var placholderTower4 = new TDVN.MapTower({x: 23, y: 8});
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
        
        var route1Data = route1.data();
        var creepHome = [
            [{x: route1Data.x, y: route1Data.y}, {x: route1Data.x, y: route1Data.y+1}], //1: left -> right
            [{x: route1Data.x, y: route1Data.y+2}, {x: route1Data.x+1, y: route1Data.y+2}], //2: top->down
            [{x: route1Data.x-1, y: route1Data.y}, {x: route1Data.x-1, y: route1Data.y+1}], //3: right -> left
            [{x: route1Data.x, y: route1Data.y-1}, {x: route1Data.x+1, y: route1Data.y-1}] //4: bottom -> up
        ];
        creepHome = creepHome[mapFlow-1];

        //4a.CREEP -> define some kind of Creep -> NormalCreep
        TDVN.CreepFactory.define('NormalCreep', {
            speed: 1,
            blood: 120,
            shield: 100
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

        //4b.CREEP -> define some kind of Creep -> SuperCreep
        TDVN.CreepFactory.define('SuperCreep', {
            speed: 2,
            blood: 420,
            shield: 5
        });
        //init some NormalCreep
        var nCreep3 = SuperCreep.create();
        var nCreep4 = SuperCreep.create();
        var nCreep5 = SuperCreep.create();
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
        
        //5.CREEP -> push created creep into queue
        TDVN.CreepQueue.push(nCreep1);
        TDVN.CreepQueue.push(nCreep2);
        TDVN.CreepQueue.push(nCreep3);
        TDVN.CreepQueue.push(nCreep4);
        TDVN.CreepQueue.push(nCreep5);

        //6. CREEP -> start running
        var creepRoute = map.pathToPosition(map.getCreepPath(creepHome), creepHome);
        startBtn.on('click', function (e) {
            startBtn.remove();
            TDVN.CreepQueue.flush(1, function (creeps) {
                $.each(creeps, function (index, creep) {
                    map.bindRoute(creep, creepRoute[index%2 == 0 ? 'rear' : 'inner']);
                });
            });
        });
    })(jQuery);
});
