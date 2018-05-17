// lazuli is the player!
var lazuli;

function startGame() {
    lazuli = new component(data[0].start[0]); // for now, get the first starting point
//    document.body.style.backgroundImage = "url('spiral.jpg')";
    // add the title to the game
    var title = document.createElement("h1");
    title.textContent = "Ascension";
    title.style.textAlign = "center";
    document.body.appendChild(title);

    gameArea.start();
}

var gameArea = {
    // make a canvas for the gaming area
    canvas : document.createElement("canvas"),

    // a list of colors for accessing
    colors : {
        "start": "green",
        "inactive": "blue",
        "exit": "brown",
        "walls": "#ffd27f",
        "guards": "red",
        "deaths": "black"
    },

    // define where the exit is
    exit: [],

    // define how big the exit is
    exitSize: 50,

    // a list of guards
    guards: [],
    
    // a list of death locations
    deaths: [],
    
    // a list of cooldowns: 0 -> blink, 1 -> stun
    cooldowns: [0, 0],

    // keep track of what level we are on, start off level 0
    level: 0,

    // decide which convolution to apply
    convList: [],

    // start off and draw for every 10 milliseconds
    start : function() {
        var dataDef = data[0];
        // the exit of the starting map, 0
        this.exit = dataDef.exit[0];

        // list of the guards of the starting map, 0
        for (var i = 0; i < dataDef.guards.length; i++) {
            var patrol = [];
            var patrolPosList = dataDef.guards[i];
            for (var j = 0; j < patrolPosList.length; j++) {
                patrol.push(new THREE.Vector2(patrolPosList[j][0], patrolPosList[j][1]));
            }
            var guard = new Guard(patrol, 2, 100, 1, Math.PI/2, 100);
            this.guards.push(guard);
        }

        this.canvas.width = 640;
        this.canvas.height = 640;
        this.ctx = this.canvas.getContext("2d");
        document.body.append(this.canvas);
        this.interval = setInterval(updateGameArea, 10);

        // add event listeners for pressing the keys — can press multiple keys
        window.addEventListener('keydown', function (e) {
            gameArea.keys = (gameArea.keys || []);
            gameArea.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            gameArea.keys[e.keyCode] = (e.type == "keydown");            
        })
    },

    // a clear function to reset
    clear: function() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// make a component 
function component(coordinates) {
    this.x = coordinates[0];
    this.y = coordinates[1];
    this.radius = 10;
    this.speed = 5;

    // update the drawing of the player
    this.update = function() {
        ctx = gameArea.ctx;
        if (gameArea.cooldowns[0] <= 0) ctx.fillStyle = gameArea.colors.start;
        else ctx.fillStyle = gameArea.colors.inactive;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI*2);
        ctx.closePath();
        ctx.fill();
    }
}

// draw all the necessary environment
function drawEnvironment() {
    /*=====================Draw the walls======================*/
    var walls = data[gameArea.level].walls;
    var ctx = gameArea.ctx;

    // draw a white background
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, gameArea.canvas.width, gameArea.canvas.height);

    ctx.beginPath();
    for (var i = 0; i < walls.length; i++) {
        // get the walls corresponding to one block (array of points)
        var oneWall = walls[i];

        ctx.moveTo(oneWall[0][0], oneWall[0][1]);
        for (var j = 1; j < oneWall.length; j++) {
            ctx.lineTo(oneWall[j][0], oneWall[j][1]);
        }
    }
    ctx.closePath();
    // fill in the walls
    ctx.fillStyle = gameArea.colors.walls;
    ctx.fill();
    
    // draw deaths
    for (var i = 0; i < gameArea.deaths.length; i++)
    {
    	var deathSize = 5;
    	var death = gameArea.deaths[i];
    	ctx = gameArea.ctx;
    	ctx.lineWidth = 2;
        ctx.strokeStyle = gameArea.colors.deaths;
        ctx.beginPath();
        ctx.moveTo(death.x + deathSize, death.y + deathSize);
        ctx.lineTo(death.x - deathSize, death.y - deathSize);
        ctx.closePath();
        ctx.stroke();
        
    	ctx.beginPath();
        ctx.moveTo(death.x - deathSize, death.y + deathSize);
        ctx.lineTo(death.x + deathSize, death.y - deathSize);
        ctx.closePath();
        ctx.stroke();
	}

    /*=====================Draw the exit======================*/
    ctx.fillStyle = gameArea.colors.exit;
    ctx.fillRect(gameArea.exit[0], gameArea.exit[1], gameArea.exitSize, gameArea.exitSize);
}

// makes all the canvas texts on title page
function makeTitlePage() {
    var ctx = gameArea.ctx;
    var canvas = gameArea.canvas;
    
    // make a gradient for the title
    var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.35, 'red');
    gradient.addColorStop(0.65, 'yellow');
    gradient.addColorStop(0.7, 'red');
    gradient.addColorStop(1, 'yellow');
    ctx.font = "2.8vw Gloria Hallelujah, cursive, Garamond";
    ctx.fillStyle = gradient;
    ctx.textAlign = "center";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.fillText("Ascension", canvas.width/2, 80);

    // write in the start
    ctx.font = "1.2vw Gloria Hallelujah, cursive, Garamond";
    ctx.fillText("<<< Move Here to Start!", 280, 350);

    // keyboards
    ctx.fillStyle = "#aaa";
    ctx.fillRect(100, 470, 50, 50);
    ctx.fillRect(40, 530, 50, 50);
    ctx.fillRect(100, 530, 50, 50);
    ctx.fillRect(160, 530, 50, 50);
    ctx.fillStyle = "black";
    ctx.fillText("W", 125, 500);
    ctx.fillText("A", 65, 560);
    ctx.fillText("S", 125, 560);
    ctx.fillText("D", 185, 560);

    // write in the guard warning
    ctx.fillStyle = gradient;
    ctx.font = "1.2vw Gloria Hallelujah, cursive, Garamond";
    ctx.fillText("Avoid Guards", 450, 430);
}

// makes all the canvas texts for credits
function makeCreditsPage() {
    var ctx = gameArea.ctx;
    var canvas = gameArea.canvas;
    
    // make a gradient for the title
    var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.35, 'red');
    gradient.addColorStop(0.65, 'yellow');
    gradient.addColorStop(0.7, 'red');
    gradient.addColorStop(1, 'yellow');
    ctx.font = "2.8vw Gloria Hallelujah, cursive, Garamond";
    ctx.fillStyle = gradient;
    ctx.textAlign = "center";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

    ctx.fillText("Congratulations!", canvas.width/2, 80);

    // write in all other text
    ctx.font = "1.2vw Gloria Hallelujah, cursive, Garamond";
    ctx.fillText("You have successfully ascended all levels of insanity!", canvas.width/2, 140);
    ctx.fillText("Created By", canvas.width/2, 240);
    ctx.fillText("Daniel Chae, Annie Chen, & Tom Colen", canvas.width/2, 270);
    ctx.fillText("Special thanks to Professor Finkelstein & COS426 peers!", canvas.width/2, 450);
    ctx.fillText("Return to Home >>>", 420, 600);
}

function makeBlinkPage() {
    var ctx = gameArea.ctx;
    var canvas = gameArea.canvas;
    
    // make a gradient for the title
    var gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
    gradient.addColorStop(0, 'red');
    gradient.addColorStop(0.35, 'red');
    gradient.addColorStop(0.65, 'yellow');
    gradient.addColorStop(0.7, 'red');
    gradient.addColorStop(1, 'yellow');
    ctx.font = "2.8vw Gloria Hallelujah, cursive, Garamond";
    ctx.fillStyle = gradient;
    ctx.textAlign = "center";
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    ctx.shadowBlur = 2;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';

    ctx.fillText("New Ability Unlocked!", canvas.width/2, 80);

    // write in all other text
    ctx.font = "1.2vw Gloria Hallelujah, cursive, Garamond";
    ctx.fillStyle = "green";
    ctx.fillText("You may now <Blink>.", 160, 200);
    ctx.fillText("Press P while walking to <Blink>", 160, 260);
    ctx.fillText("in that direction.", 160, 285);
    ctx.fillText("Beware of cooldown (available when green)!", canvas.width/2, 600);
}

// draw all the guards
function drawGuards() {
    var walls = data[gameArea.level].walls;
    for (var i = 0; i < gameArea.guards.length; i++) {
        gameArea.guards[i].show(gameArea.ctx, walls);
        gameArea.guards[i].move();


        if (gameArea.guards[i].caught(new THREE.Vector2(lazuli.x, lazuli.y),  walls)) {
        	gameArea.deaths.push(new THREE.Vector2(lazuli.x, lazuli.y));
            lazuli = new component(data[gameArea.level].start[0]);
        }
    }
}

// handle when the player reaches the exit
function reachExit() {
    var x = lazuli.x;
    var y = lazuli.y;
    var xBound = gameArea.exit[0];
    var yBound = gameArea.exit[1];

    // if true, we have reached the exit
    if (x >= xBound && x <= xBound+gameArea.exitSize && y >= yBound && y <= yBound+gameArea.exitSize) {
        gameArea.level += 1; // we go onto next level
        if (gameArea.level >= data.length)
            gameArea.level = 0;

        var newData = data[gameArea.level];
        lazuli = new component(newData.start[0]); // player position reset
        gameArea.exit = newData.exit[0]; // reset the exit

        // select a convolution from the list randomly
        var convIndex = parseInt(Math.random()*newData.conv.length, 10);
        gameArea.convList = newData.conv[convIndex];

        // reset list of guards, based on convList
        gameArea.guards = [];
        for (var i = 0; i < newData.guards.length; i++) {
            var patrol = [];
            var patrolPosList = newData.guards[i];
            for (var j = 0; j < patrolPosList.length; j++) {
                patrol.push(new THREE.Vector2(patrolPosList[j][0], patrolPosList[j][1]));
            }
            var speed = 2;
            if (gameArea.convList.length > 0 && gameArea.convList.length > 0) 
                speed = 2 + gameArea.convList.length*2.5 + 0.05*newData.guards.length;
            var guard = new Guard(patrol, speed, 100, 1, Math.PI/2, Math.round(200/speed));
            gameArea.guards.push(guard);
        }
        
        // reset list of deaths
        gameArea.deaths = [];

        gameArea.clear();
        drawEnvironment();
        drawGuards();
    }

}

function blink() {
    var blinkDist = 100;
    var blinkCooldown = 100;
    var x = 0;
    var y = 0;
        
    // get direction
    if (gameArea.keys && gameArea.keys[87]) y -= 1;
    if (gameArea.keys && gameArea.keys[65]) x -= 1;
    if (gameArea.keys && gameArea.keys[83]) y += 1;
    if (gameArea.keys && gameArea.keys[68]) x += 1;
 
    var direction = (new THREE.Vector2(x, y)).normalize();
    gameArea.cooldowns[0] = blinkCooldown;
        
    var numWalls = 0;
    var lastWall = [-1, -1];
    var lastValid = new THREE.Vector2(lazuli.x, lazuli.y);
    for (var i = 1; i < blinkDist+1; i++) {
        var collided = checkWallCollision((new THREE.Vector2(lazuli.x + direction.x * i, lazuli.y + direction.y * i)), gameArea.level);
        if (collided[0] >= 0 && (lastWall[0] != collided[0] || lastWall[1] != collided[1])) {
            lastWall = collided;
            numWalls++;
        }
            
        // can't pass through one wall -- parity check to see if blinkable
        if (numWalls % 2 === 0 && collided < 0) {
            lastValid.x = lazuli.x + direction.x * i;
            lastValid.y = lazuli.y + direction.y * i;
        }
    }
        
    lazuli.x = lastValid.x;
    lazuli.y = lastValid.y;
}

// update everything necessary
function updateGameArea(coordinates) {
    gameArea.clear();
    drawEnvironment();
    drawGuards();
    // draw in the title page if on title page
    if (gameArea.level === 0) {
        makeTitlePage();
    }
    // draw in the help page for blinking, unlocks at level 6
    else if (gameArea.level === 6) {
        makeBlinkPage();
    }
    // draw in the credits page if on last map
    else if (gameArea.level === data.length-1) {
        makeCreditsPage();
    }

	// blink feature //
    if (gameArea.keys && gameArea.keys[80] && gameArea.cooldowns[0] <= 0) {
    	blink();
    }
    else
    {
		// if key is pressed, update the position of the player
		if (gameArea.keys && gameArea.keys[87]) {if (checkWallCollision((new THREE.Vector2(lazuli.x, lazuli.y - lazuli.speed)), gameArea.level) === -1) {lazuli.y -= lazuli.speed}};
		if (gameArea.keys && gameArea.keys[65]) {if (checkWallCollision((new THREE.Vector2(lazuli.x - lazuli.speed, lazuli.y)), gameArea.level) === -1) {lazuli.x -= lazuli.speed}};
		if (gameArea.keys && gameArea.keys[83]) {if (checkWallCollision((new THREE.Vector2(lazuli.x, lazuli.y + lazuli.speed)), gameArea.level) === -1) {lazuli.y += lazuli.speed}};
		if (gameArea.keys && gameArea.keys[68]) {if (checkWallCollision((new THREE.Vector2(lazuli.x + lazuli.speed, lazuli.y)), gameArea.level) === -1) {lazuli.x += lazuli.speed}};
    }
    
    // lower cooldowns by 1 time
    for (var i = 0; i < gameArea.cooldowns.length; i++)
    {
    	var decrease = lazuli.speed / 2;
    	gameArea.cooldowns[i] -= decrease; 
    }


    lazuli.update();

    // change the speed based on the map
    lazuli.speed = 2;
    if (gameArea.convList.length > 0 && gameArea.convList.length > 0) 
        lazuli.speed = 2 + gameArea.convList.length*2.5 + 0.05*data[gameArea.level].guards.length;

    // apply convolution(s) to the canvas map
    imageData = gameArea.ctx.getImageData(0, 0, gameArea.canvas.width, gameArea.canvas.height);
    imageData2 = gameArea.ctx.getImageData(0, 0, gameArea.canvas.width, gameArea.canvas.height);
    var newImage = applyConvolutions(imageData, gameArea.convList, imageData2, lazuli);
    gameArea.ctx.putImageData(newImage, 0, 0);

    reachExit(); // check if player is at the exit
}