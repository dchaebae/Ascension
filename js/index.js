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
        "start": "blue",
        "exit": "brown",
        "walls": "#ffd27f",
        "guards": "red"
    },

    // define where the exit is
    exit: [],

    // define how big the exit is
    exitSize: 50,

    // a list of guards
    guards: [],

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
        ctx.fillStyle = gameArea.colors.start;
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
    ctx.fillText("<<< Enter to Start!", 280, 350);

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

// draw all the guards
function drawGuards() {
    var walls = data[gameArea.level].walls;
    for (var i = 0; i < gameArea.guards.length; i++) {
        gameArea.guards[i].show(gameArea.ctx, walls);
        gameArea.guards[i].move();

        if (gameArea.guards[i].caught(new THREE.Vector2(lazuli.x, lazuli.y), walls)) {
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
            if (gameArea.convList.length > 0) speed = 2 + gameArea.convList.length*2.5;
            var guard = new Guard(patrol, speed, 100, 1, Math.PI/2, Math.round(200/speed));
            gameArea.guards.push(guard);
        }

        gameArea.clear();
        drawEnvironment();
        drawGuards();
    }

}

// update everything necessary
function updateGameArea(coordinates) {
    gameArea.clear();
    if (gameArea.level === 0) {
        gameArea.ctx.fillStyle = "#444";
        gameArea.ctx.fillRect(0, 0, gameArea.canvas.width, gameArea.canvas.height);
    }
    drawEnvironment();
    drawGuards();
    // draw in the title page if on title page
    if (gameArea.level === 0) {
        makeTitlePage();
    }

    // if key is pressed, update the position of the player
    if (gameArea.keys && gameArea.keys[87]) {if (checkWallCollision("y", -1, gameArea.level)) {lazuli.y -= lazuli.speed}};
    if (gameArea.keys && gameArea.keys[65]) {if (checkWallCollision("x", -1, gameArea.level)) {lazuli.x -= lazuli.speed}};
    if (gameArea.keys && gameArea.keys[83]) {if (checkWallCollision("y", 1, gameArea.level)) {lazuli.y += lazuli.speed}};
    if (gameArea.keys && gameArea.keys[68]) {if (checkWallCollision("x", 1, gameArea.level)) {lazuli.x += lazuli.speed}};

    lazuli.update();

    // change the speed based on the map
    lazuli.speed = 2;
    if (gameArea.convList.length > 0) lazuli.speed = 2 + gameArea.convList.length*2.5;

    // apply convolution(s) to the canvas map
    imageData = gameArea.ctx.getImageData(0, 0, gameArea.canvas.width, gameArea.canvas.height);
    imageData2 = gameArea.ctx.getImageData(0, 0, gameArea.canvas.width, gameArea.canvas.height);
    var newImage = applyConvolutions(imageData, gameArea.convList, imageData2, lazuli);
    gameArea.ctx.putImageData(newImage, 0, 0);

    reachExit(); // check if player is at the exit
}