// lazuli is the player!
var lazuli;

function startGame() {
	lazuli = new component(data[0].start[0]); // for now, get the first starting point

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
        "walls": "black",
        "guards": "red"
	},

	// define where the exit is
	exit: [],

	// start off and draw for every 10 milliseconds
	start : function() {
		this.exit = data[0].exit[0]; // default start at map 0

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
	this.speed = 2;

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
	var walls = data[0].walls; // temporarily get from map 0
	var ctx = gameArea.ctx;
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
	const stairSize = 50;
	ctx.fillStyle = gameArea.colors.exit;
	ctx.fillRect(gameArea.exit[0], gameArea.exit[1], stairSize, stairSize);

}

// check to see if the player will be moving into a wall
function checkWallCollision(axis, dir) {
	var q = {};
	if (axis === "x" && dir > 0)
		q = {"x" : lazuli.x + lazuli.speed, "y" : lazuli.y}; 
	else if (axis === "x")
		q = {"x" : lazuli.x - lazuli.speed, "y" : lazuli.y}; 
	else if (axis === "y" && dir > 0)
		q = {"x" : lazuli.x, "y" : lazuli.y + lazuli.speed}; 
	else
		q = {"x" : lazuli.x, "y" : lazuli.y - lazuli.speed}; 

	// check the boundaries
	if (q.x < lazuli.radius || q.y < lazuli.radius)
		return false;
	if (q.x > gameArea.canvas.width - lazuli.radius)
		return false;
	if (q.y > gameArea.canvas.height - lazuli.radius)
		return false;

	var walls = data[0].walls; // temporarily get from map 0

	for (var i = 0; i < walls.length; i++) {
		// get the walls corresponding to one block (array of points)
		var oneWall = walls[i];

		for (var j = 0, k = 1; j < oneWall.length; j++, k++) {
		    if (k === oneWall.length) k = 0;
		    // the coordinates of the line segment of the wall
		    var p1 = {"x" : oneWall[j][0], "y" : oneWall[j][1]};
		    var p2 = {"x" : oneWall[k][0], "y" : oneWall[k][1]};

		    // get the minimum distance from the point to the wall, > 0 by design of json
		    var dist2 = (p2.x - p1.x)*(p2.x - p1.x) + (p2.y - p1.y) * (p2.y - p1.y);
		    var t = ((q.x - p1.x) * (p2.x - p1.x) + (q.y - p1.y) * (p2.y - p1.y)) / dist2;
		    // find parametric t along wall (t must be between 0 and 1)
		    t = Math.max(0, Math.min(1, t));
		    var qProj = {"x" : p1.x + t * (p2.x - p1.x), "y" : p1.y + t * (p2.y - p1.y)};
		    var dist = Math.sqrt((q.x - qProj.x)*(q.x - qProj.x) + (q.y - qProj.y) * (q.y - qProj.y));
		    // if the distance is less, then it is within the wall, so not valid
		    if (dist < lazuli.radius) return false;
		}
	}

	return true;
}

// update everything necessary
function updateGameArea(coordinates) {
	gameArea.clear();
	drawEnvironment();

	// if key is pressed, update the position of the player
	if (gameArea.keys && gameArea.keys[87]) {if (checkWallCollision("y", -1)) {lazuli.y -= lazuli.speed}};
	if (gameArea.keys && gameArea.keys[65]) {if (checkWallCollision("x", -1)) {lazuli.x -= lazuli.speed}};
	if (gameArea.keys && gameArea.keys[83]) {if (checkWallCollision("y", 1)) {lazuli.y += lazuli.speed}};
	if (gameArea.keys && gameArea.keys[68]) {if (checkWallCollision("x", 1)) {lazuli.x += lazuli.speed}};

	lazuli.update();
}




    /*function draw()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw the walls again
        // temporarily get the walls from map 0
	    


    }*/

