$(document).ready(function(){
    const types = 4;
    const dotRadius = 10;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var objs = [];
    var colors = ["blue", "green", "red", "black", "orange"];
    for (var i = 0; i < types; i++) objs.push([]);

    function drawObj(type)
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
    }

    function draw()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        for(var i = 0; i < types; i++)
        {
            drawObj(i);
        }
    }

    setInterval(draw, 10);
});