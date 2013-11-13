TDVN.MapLoader = {
    config: {
        x: 24,
        y: 16,
        size: 40
    }
}
TDVN.debug = false;

jQuery(document).ready(function () {
    (function ($) {
        //1.MAP -> create a map: 32,16 grid with cell size dependant on screen height(fit screen height)
        var mapConfig = TDVN.MapLoader.config;
        var map = new TDVN.Map([mapConfig.x, mapConfig.y], mapConfig.size);
        
        if ( TDVN.debug ) {
            //for debug only, show map grid guides
            var cell = $('<div class="GridCell"></div>');
            var j = 0;
            for ( var i = 0; i < mapConfig.x*mapConfig.y; i++ ) {
                var _cell_ = cell.clone().css({width:mapConfig.size, height:mapConfig.size});
                if ( i >= 0 && i < mapConfig.x ) { _cell_.text(i+1); }
                if ( i-(j*mapConfig.x) == 0 ) { _cell_.text(++j); }
                map.obj.append(_cell_); 
            }
        }

        //**ROUTE -> create some routes
        //new TDVN.MapRuute(startPoint/*object{x,y}*/, length, axis/*String x|y*/, direction)
		var route1 = new TDVN.MapRoute({x: 1, y: 7}, 24, 'x', 1);
        //add created routes to map
        map.add({ //route 1
            object: route1,
            isRoute: true,
            x: route1.data('x'),
            y: route1.data('y')
        });
       
        //2.TOWER PLACEHOLDER -> create some placeholder for tower
        var towerPlacholderConfig = [
            {x: 5, y: 4},
            {x: 12, y: 4},
            {x: 19, y: 4},
            {x: 5, y: 10},
            {x: 12, y: 10},
            {x: 19, y: 10}
        ];
        var towerPlacholder = [];
        $.each(towerPlacholderConfig, function (index, config) {
            towerPlacholder.push(new TDVN.MapTower(config));
            towerPlacholder[index].obj.data('placeholderIndex', index);
            map.add({ //placeholder tower
                object: towerPlacholder[index].obj,
                x: towerPlacholder[index].x,
                y: towerPlacholder[index].y
            });
        });
        TDVN.TowerFactory.define('Lua', {
            speed: 2, //number or firing per second
            damage: 30, //number of creep blood will be decreased
            effect: {},
            scope: 2, //area around tower, by grid cell -> [3x3] around tower
            multiple: 1 //number of creep that tower can attack at the same time
        });
        TDVN.TowerFactory.define('Bang', {
            speed: 1, //number or firing per second
            damage: 20, //number of creep blood will be decreased
            effect: {},
            scope: 2, //area around tower, by grid cell -> [3x3] around tower
            multiple: 1 //number of creep that tower can attack at the same time
        });
        TDVN.TowerFactory.define('SamSet', {
            speed: 4, //number or firing per second
            damage: 35, //number of creep blood will be decreased
            effect: {},
            scope: 2, //area around tower, by grid cell -> [3x3] around tower
            multiple: 1 //number of creep that tower can attack at the same time
        });
        TDVN.TowerFactory.define('Kiem', {
            speed: 1, //number or firing per second
            damage: 40, //number of creep blood will be decreased
            effect: {},
            scope: 2, //area around tower, by grid cell -> [3x3] around tower
            multiple: 1 //number of creep that tower can attack at the same time
        }); 
        TDVN.TowerFactory.define('Da', {
            speed: 1, //number or firing per second
            damage: 30, //number of creep blood will be decreased
            effect: {},
            scope: 2, //area around tower, by grid cell -> [3x3] around tower
            multiple: 1 //number of creep that tower can attack at the same time
        });
        TDVN.TowerFactory.define('Phao', {
            speed: 5, //number or firing per second
            damage: 50, //number of creep blood will be decreased
            effect: {},
            scope: 2, //area around tower, by grid cell -> [5x5] around tower
            multiple: 1 //number of creep that tower can attack at the same time
        });
        TDVN.TowerFactory.define('Ten', {
            speed: 5, //number or firing per second
            damage: 50, //number of creep blood will be decreased
            effect: {},
            scope: 2, //area around tower, by grid cell -> [5x5] around tower
            multiple: 1 //number of creep that tower can attack at the same time
        });
        TDVN.TowerFactory.define('Tien', {
            speed: 5, //number or firing per second
            damage: 50, //number of creep blood will be decreased
            effect: {},
            scope: 2, //area around tower, by grid cell -> [5x5] around tower
            multiple: 1 //number of creep that tower can attack at the same time
        });
        
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
        creepHome = creepHome[0];

        //4a.CREEP -> define some kind of Creep
		TDVN.CreepFactory.define('TinyCreep', {
            speed: 1,
            blood: 70,
            shield: 1
        });
		var nCreep1 = TinyCreep.create();
        var nCreep2 = TinyCreep.create();
        var nCreep3 = TinyCreep.create();
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
		
		TDVN.CreepFactory.define('SmallCreep', {
            speed: 1,
            blood: 100,
            shield: 2
        });
		var nCreep4 = SmallCreep.create();
        var nCreep5 = SmallCreep.create();
		var nCreep6 = SmallCreep.create();
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
        
        TDVN.CreepFactory.define('NormalCreep', {
            speed: 1,
            blood: 120,
            shield: 3
        });
        //init some NormalCreep
        var nCreep7 = NormalCreep.create();
        var nCreep8 = NormalCreep.create();
        var nCreep9 = NormalCreep.create();
        var nCreep10 = NormalCreep.create();
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
            x: creepHome[1].x,
            y: creepHome[1].y
        });
        
        TDVN.CreepFactory.define('SuperCreep', {
            speed: 0.75,
            blood: 400,
            shield: 5
        });
        //init some NormalCreep
        var nCreep11 = SuperCreep.create();
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

        //6. User-defined function
        var circleTower = $('<ul class="CircleTower"></ul>');
        if ( $('.CircleTower').length == 0 ) { circleTower.appendTo('body'); }
        var towerChoiceLayer1 = String(
            '<li><a class="TowerGroupType TienThap" href="#" title=""></a></li>'+
            '<li><a class="TowerGroupType PhapSuThap" href="#" title=""></a></li>'+
            '<li><a class="TowerGroupType PhaoThap" href="#" title=""></a></li>'+
            '<li><a class="TowerGroupType TranPhapThap" href="#" title=""></a></li>'
        );
        circleTower.html(towerChoiceLayer1);

        var activeTowerPlaceHolder;
        //6a. event on map tower placeholder
        var mapTowerPlaceholders = $('.MapTower');
        mapTowerPlaceholders.on('click touchstart', function (e) {
            var $target = $(e.currentTarget);
            if ( $target.hasClass('Disabled') ) { return false; }
            activeTowerPlaceHolder = $target.data('placeholderIndex');
            circleTower.removeClass('Active').css({
                top: $target.offset().top - 70,
                left: $target.offset().left - 70
            }).html(towerChoiceLayer1).addClass('Active');
            e.stopPropagation();
        });
        
        //6b. event tower type choice
        circleTower
            .on('click touchstart', 'a.TowerGroupType', function (e) {
                var tower = $(this);
                var towerName = tower.attr('class');
                circleTower.removeClass('Active');
                var liEl;
                if ( tower.hasClass('TienThap') ) {
                    liEl = $(
                        '<li><a class="TowerType TenT" href="#" title="" data-tower-class="Ten"></a></li>'+
                        '<li><a class="TowerType TienT" href="#" title="" data-tower-class="Tien"></a></li>'
                    );
                }
                else if ( tower.hasClass('PhapSuThap') ) {
                    liEl = $(
                        '<li><a class="TowerType LuaT" href="#" title="" data-tower-class="Lua"></a></li>'+
                        '<li><a class="TowerType BangT" href="#" title="" data-tower-class="Bang"></a></li>'
                    );
                }
                else if ( tower.hasClass('PhaoThap') ) {
                    liEl = $(
                        '<li><a class="TowerType DaT" href="#" title="" data-tower-class="Da"></a></li>'+
                        '<li><a class="TowerType PhaoT" href="#" title="" data-tower-class="Phao"></a></li>'
                    );
                }
                else if ( tower.hasClass('TranPhapThap') ) {
                    liEl = $(
                        '<li><a class="TowerType SamSetT" href="#" title="" data-tower-class="SamSet"></a></li>'+
                        '<li><a class="TowerType KiemT" href="#" title="" data-tower-class="Kiem"></a></li>'
                    );
                }
                circleTower.empty().append(liEl).addClass('Active')
                return false;
            })
            .on('click touchstart', 'a.TowerType', function (e) {
                circleTower.removeClass('Active');
                mapTowerPlaceholders.eq(activeTowerPlaceHolder).css('background', 'none');
                towerPlacholder[activeTowerPlaceHolder].build(window[$(e.currentTarget).data('towerClass')].create());
                return false;
            });


        //6c. event on document
        $(document).on('click touchstart', function (e) {
            circleTower.removeClass('Active');
        });

        //7. CREEP -> start running
        TDVN.Mediator.sub('creepEscaped', function (creep) { //creep escaped :(
            creep.obj.fadeOut('medium');
        });
        var creepRoute = map.pathToPosition(map.getCreepPath(creepHome), creepHome);
        var startBtn = $('<button id="startBtn" class="StartBtn">Creep run</button>').appendTo('body');
        startBtn.on('click touchstart', function (e) {
            startBtn.remove();
            $('.MapTower').addClass('Disabled');
            circleTower.removeClass('Active');
            TDVN.CreepQueue.flush(2, function (creeps) {
                $.each(creeps, function (index, creep) {
                    map.bindRoute(creep, creepRoute[index%2 == 0 ? 'rear' : 'inner']);
                });
            });
        });
    })(jQuery);
});