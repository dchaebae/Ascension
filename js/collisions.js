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

// update everything necessary
function updateGameArea(coordinates) {
	gameArea.clear();
	drawEnvironment();

	// if key is pressed, update the position of the player
	if (gameArea.keys && gameArea.keys[87]) lazuli.y -= 2;
	if (gameArea.keys && gameArea.keys[65]) lazuli.x -= 2;
	if (gameArea.keys && gameArea.keys[83]) lazuli.y += 2;
	if (gameArea.keys && gameArea.keys[68]) lazuli.x += 2;

	lazuli.update();
}




    /*function draw()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // draw the walls again
        // temporarily get the walls from map 0
	    


    }*/

