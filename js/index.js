$(document).ready(function(){
    const types = 4;
    const dotRadius = 10;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var pos1 = new THREE.Vector2(50, 50);
    var pos2 = new THREE.Vector2(300, 50);
    var pos3 = new THREE.Vector2(300, 300);
    var pos4 = new THREE.Vector2(50, 300);
    var patrol = [pos1, pos2, pos3, pos4];
    var guard = new Guard(patrol, 2, 100, 1, Math.PI / 2, 100);
    //var objs = [];
    //var colors = ["blue", "green", "red", "black", "orange"];
    //for (var i = 0; i < types; i++) objs.push([]);
        
    /* function drawObj(type)
    {
        var currObjs = objs[type];
        for (var i = 0; i < currObjs.length; i++)
        {
            var currObj = currObjs[i];
            ctx.fillStyle = colors[type];
            ctx.strokeStyle = colors[type];
            ctx.beginPath();
            if (type === 0)
            {
                ctx.arc(currObj[0][0], currObj[0][1], dotRadius, 0, Math.PI*2);
            }
            else
            {
                ctx.moveTo(currObj[0][0], currObj[0][1]);
                for (var j = 1; j < currObj.length; j++)
                {
                    ctx.lineTo(currObj[j][0], currObj[j][1]);
                }
            }
            ctx.closePath();
            if (type === 0 || type === 3) ctx.fill();
            else ctx.stroke();
        }   
    }*/

    function draw()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        guard.show(ctx);
        guard.move();
    }

    setInterval(draw, 10);
});