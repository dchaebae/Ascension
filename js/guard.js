const size = 10;
const color = "red";
const stunColor = "black";
const visionColor = "yellow";
const closestColor = "orange";
const nrays = 10;
const radius = 10;
class Guard
{
	/*
		Instance variables:
		Vec2 Location
		Vec2 walkDirection
		Vec2[] patrol
		int dest
		int walkSpeed = the number of pixels travelled per dt
		Vec2 sightDirection
		int sightRange
		int sightWidth (radians)
		int rotation
		int waitTime
		int currWait
		int stunned
	*/
	constructor(patrol, walkSpeed, sightRange, sightWidth, rotation, waitTime)
	{
		this.locate = (new THREE.Vector2()).copy(patrol[0]);
		this.patrol = patrol;
		this.walkDirection = (patrol.length > 1) ? (new THREE.Vector2()).subVectors(patrol[1], patrol[0]).normalize() : new THREE.Vector2();
		this.dest = (patrol.length > 1) ? 1 : 0;
		this.walkSpeed = walkSpeed;
		this.sightDirection = (patrol.length > 1) ? (new THREE.Vector2()).copy(this.walkDirection) : new THREE.Vector2(0, 1);
		this.sightRange = sightRange;
		this.sightWidth = sightWidth;
		this.waitTime = waitTime;
		this.rotation = rotation;
		this.currWait = 0;
		this.step1;
		this.step2;
		this.stunned = 0;
	}

	get location()
	{
		return this.locate;
	}

	set location(val)
	{
		this.locate = val;
	}

	move()
	{
		var distance = (new THREE.Vector2()).subVectors(this.patrol[this.dest], this.location).length();
		if (this.currWait === 0 && this.stunned === 0)
		{
			if (distance < this.walkSpeed)
			{
				this.location = (new THREE.Vector2()).copy(this.patrol[this.dest]);
				this.dest = (this.dest + 1 >= this.patrol.length) ? 0 : this.dest + 1;
				this.walkDirection = (new THREE.Vector2()).subVectors(this.patrol[this.dest], this.location).normalize();
				this.currWait = this.waitTime;
				this.step1 = -this.rotation / (this.waitTime / 2);
				var rotatedAngle = this.rotateVector(this.sightDirection, -this.rotation); 
				if (this.step1 * this.step2 > 0) this.step1 = -this.step1;
				this.step2 = Math.acos(rotatedAngle.dot(this.walkDirection)) / (this.waitTime / 2);
			}
			else
			{
				this.location.add((new THREE.Vector2()).copy(this.walkDirection).multiplyScalar(this.walkSpeed));
			}			
		}
		else if (this.stunned > 0)
		{
			this.stunned = this.stunned - 1;
		}
		else if (this.currWait === 1)
		{
			this.sightDirection = (new THREE.Vector2()).copy(this.walkDirection);
			this.currWait--;
		}
		else
		{
			if (this.currWait > this.waitTime / 2) this.sightDirection = this.rotateVector(this.sightDirection, this.step1);
			else this.sightDirection = this.sightDirection = this.rotateVector(this.sightDirection, this.step2);
			this.currWait--;
		}
	}

	rotateVector(vec, angle)
	{
		var sin = Math.sin(angle);
   		var cos = Math.cos(angle);
   		return new THREE.Vector2(vec.x * cos - vec.y * sin, vec.x * sin + vec.y * cos);
	}
	
	rotateAround(vec, center, angle)
	{
   		return (new THREE.Vector2()).addVectors(this.rotateVector(vec, angle), center);
	}

	PointInTriangle(p, a,b,c)
    {
	    var as_x = p.x-a.x;
	    var as_y = p.y-a.y;

	    var s_ab = (b.x-a.x)*as_y-(b.y-a.y)*as_x > 0;

	    if((c.x-a.x)*as_y-(c.y-a.y)*as_x > 0 == s_ab) return false;

	    if((c.x-b.x)*(p.y-b.y)-(c.y-b.y)*(p.x-b.x) > 0 != s_ab) return false;

	    return true;
    }

	
	// Given three colinear points p, q, r, the function checks if
	// point q lies on line segment 'pr'
	onSegment(p, q, r)
	{
	    if (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) && q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y)) 
	    	return true;
	    return false;
	}

	// To find orientation of ordered triplet (p, q, r).
	// The function returns following values
	// 0 --> p, q and r are colinear
	// 1 --> Clockwise
	// 2 --> Counterclockwise
	static orientation(p, q, r)
	{
	    var val = (q.y - p.y) * (r.x - q.x) -
	              (q.x - p.x) * (r.y - q.y);
	 
	    if (val === 0) return 0;  // colinear
	 
	    return (val > 0)? 1: 2; // clock or counterclock wise
	}

	// The main function that returns true if line segment 'p1q1'
	// and 'p2q2' intersect.
	doIntersect(p1, q1, p2, q2)
	{
	    // Find the four orientations needed for general and
	    // special cases
	    var o1 = this.orientation(p1, q1, p2);
	    var o2 = this.orientation(p1, q1, q2);
	    var o3 = this.orientation(p2, q2, p1);
	    var o4 = this.orientation(p2, q2, q1);
	 
	    // General case
	    if (o1 != o2 && o3 != o4)
	        return true;
	 
	    // Special Cases
	    // p1, q1 and p2 are colinear and p2 lies on segment p1q1
	    if (o1 == 0 && this.onSegment(p1, p2, q1)) return true;
	 
	    // p1, q1 and q2 are colinear and q2 lies on segment p1q1
	    if (o2 == 0 && this.onSegment(p1, q2, q1)) return true;
	 
	    // p2, q2 and p1 are colinear and p1 lies on segment p2q2
	    if (o3 == 0 && this.onSegment(p2, p1, q2)) return true;
	 
	     // p2, q2 and q1 are colinear and q1 lies on segment p2q2
	    if (o4 == 0 && this.onSegment(p2, q1, q2)) return true;
	 
	    return false; // Doesn't fall in any of the above cases
	}

	CollidedWithWall(p1, p2, walls)
	{
		var length = (new THREE.Vector3()).subVectors(p1, p2).length();
		for (var i = 0; i < walls.length; i++)
		{
			var oneWall = walls[i];

			for (var j = 0, k = 1; j < oneWall.length; j++, k++) {
			    if (k === oneWall.length) k = 0;
			    // the coordinates of the line segment of the wall
			    var q1 = new THREE.Vector2(oneWall[j][0], oneWall[j][1]);
			    var q2 = new THREE.Vector2(oneWall[k][0], oneWall[k][1]);
			    if (this.doIntersect(p1, p2, q1, q2)) return [i, j];
			}
		}
		return null;
	}

	adjustVision(a, b, c, walls, rays)
	{
		var vec = (new THREE.Vector2()).subVectors(c, b);
		vec = vec.divideScalar(rays-1);
		var points = [];
		var champ;
		for (var i = 0; i < rays; i++)
		{
			var vecCopy = (new THREE.Vector2()).copy(vec);
			var d = (new THREE.Vector2()).addVectors(b, vecCopy.multiplyScalar(i));
			for (var j = 0; j < walls.length; j++)
			{
				var wall = walls[j];
				for(var k = 0, n = 1; k < wall.length; k++, n++)
				{
					if (n === wall.length) n = 0;
					var A1 = d.y - a.y;
					var B1 = a.x - d.x;
					var C1 = A1 * a.x + B1 * a.y;

					var A2 = wall[n][1] - wall[k][1];
					var B2 = wall[k][0] - wall[n][0];
					var C2 = A2 * wall[k][0] + B2 * wall[k][1];

					var det = A1 * B2 - A2 * B1;
					if (det != 0)
					{
						var x = Math.round((B2 * C1 - B1 * C2) / det);
						var y = Math.round((A1 * C2 - A2 * C1) / det);
						if (Math.min(a.x, d.x) <= x && Math.max(a.x, d.x) >= x && Math.min(a.y, d.y) <= y && Math.max(a.y, d.y) >= y && 
							Math.min(wall[n][0], wall[k][0]) <= x && Math.max(wall[n][0], wall[k][0]) >= x && Math.min(wall[n][1], wall[k][1]) <= y && Math.max(wall[n][1], wall[k][1]) >= y)
						{
							d = new THREE.Vector2(x, y);
						}
					}
				}
			}
			points.push(d);
		}

		return points;
	}

	show(ctx, walls, closest)
	{
		var locate = (new THREE.Vector2().copy(this.location));
		if (this.stunned === 0)
		{

			// draw his vision
   			ctx.beginPath();
   			ctx.fillStyle = visionColor;
   			ctx.moveTo(locate.x, locate.y);

   			var straight = (new THREE.Vector2()).copy(this.sightDirection).multiplyScalar(this.sightRange);
   			var up = this.rotateAround(straight, locate, this.sightRange/2);
   			var down = this.rotateAround(straight, locate, -this.sightRange/2);
   			var verts = this.adjustVision(locate, up, down, walls, nrays);
   			for (var i = 0; i < nrays; i++)
   			{
   				ctx.lineTo(verts[i].x, verts[i].y);
   			}
   			ctx.closePath();
   			ctx.fill();
		}
		// draw the guard
		ctx.beginPath();
		if (closest) ctx.fillStyle = closestColor;
		else if (this.stunned === 0) ctx.fillStyle = color;
		else ctx.fillStyle = stunColor;
        	ctx.arc(locate.x, locate.y, size, 0, Math.PI*2);
        	ctx.closePath();
        	ctx.fill();
	}

	caught(p, walls)
	{
		if (this.stunned > 0) return false;
		var straight = (new THREE.Vector2()).copy(this.sightDirection).multiplyScalar(this.sightRange);
   		var up = this.rotateAround(straight, this.location, this.sightRange/2);
		var down = this.rotateAround(straight, this.location, -this.sightRange/2);
		if ((new THREE.Vector2()).subVectors(p, this.location).length() <= radius + size) return true;
		else if (!this.PointInTriangle(p, this.location, up, down)) return false;
		else return this.CollidedWithWall(p, this.location, walls) == null;
	}

	stun(duration)
	{
		this.stunned = duration;
	}

	slow(num)
	{
		this.walkSpeed = 2 + 2.5 * num;
		this.waitTime = 200 / this.walkSpeed;
	}
}