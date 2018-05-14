// check to see if the player will be moving into a wall
// return true if 
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