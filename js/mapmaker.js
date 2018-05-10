$(document).ready(function(){
    const types = 4;
    const dotRadius = 10;
    const stairSize = 50;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var mousepoint = [0,0];
    var type = 0;
    var active = false;
    var objs = [];
    var vmax = [1, 1, Infinity, Infinity];
    var omax = [1, 1, Infinity, Infinity];
    var colors = ["blue", "brown", "black", "red"];
    for (var i = 0; i < types; i++) objs.push([]);
    var newObj = [];

    $('#canvas').mousedown(function(e){
        var point = [e.pageX - this.offsetLeft, e.pageY - this.offsetTop];
        if(!active) newObj = [];
        active = true;
        newObj.push(point);
        if (newObj.length === vmax[type]) deactivate(type);
    });

    $('#type').change(function(){
        if (active) deactivate(type);
        type = this.value;
    });

    $('#clear').click(function()
    {
        newObj = [];
        active = false;
        objs = [];
        for (var i = 0; i < types; i++) objs.push([]);
    });

    $('#canvas').mousemove(function(e){
        mousepoint[0] = e.pageX - this.offsetLeft;
        mousepoint[1] = e.pageY - this.offsetTop;
    });

    $('#text').click(function(){
        $('#textbox').val('');
        $('#textbox').val(JSON.stringify(objs));
    });

    function deactivate(type)
    {
        active = false;
        var currObjs = objs[type];
        while(currObjs.length >= omax[type]) currObjs.pop();
        currObjs.push(newObj);
        newObj = [];
    }

    function keyUpHandler(e) {
        if(e.keyCode === 27) {
            if (active) deactivate(type);
        }
    }

    function drawObj(type)
    {
        var currObjs = objs[type];
        for (var i = 0; i < currObjs.length; i++)
        {
            var currObj = currObjs[i];
            ctx.fillStyle = colors[type];
            ctx.strokeStyle = colors[type];
            if (type === 0)
            {
                ctx.beginPath();
                ctx.arc(currObj[0][0], currObj[0][1], dotRadius, 0, Math.PI*2);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === 1)
            {
                var thisX = currObj[0][0];
                var thisY = currObj[0][1];
                ctx.fillRect(thisX, thisY, stairSize, stairSize);
            }
            else
            {
                ctx.moveTo(currObj[0][0], currObj[0][1]);
                for (var j = 1; j < currObj.length; j++)
                {
                    ctx.lineTo(currObj[j][0], currObj[j][1]);
                }
                ctx.closePath();
                if (type != 3) ctx.fill();
                else ctx.stroke();
            }

        }   
    }

    function drawNewObj(type)
    {
        if (newObj.length > 0)
        {
            ctx.beginPath();
            ctx.strokeStyle = colors[type];
            ctx.moveTo(newObj[0][0], newObj[0][1]);
            for (var i = 1; i < newObj.length; i++)
            {
                ctx.lineTo(newObj[i][0], newObj[i][1]);
            }
            ctx.lineTo(mousepoint[0], mousepoint[1]);
            ctx.stroke();
        }
    }

    function draw()
    {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawNewObj(type);
        for(var i = 0; i < types; i++)
        {
            drawObj(i);
        }
    }
    document.addEventListener("keyup", keyUpHandler, false);

    setInterval(draw, 10);
});