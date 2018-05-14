'use strict';

$(document).ready(function(){
    var types = ["start", "exit", "walls", "guards"];
    const dotRadius = 10;
    const stairSize = 50;
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    var mousepoint = [0,0];
    var type = "start"; // object type
    var active = false;
    var objs = {};
    // max number of vertices of that type
    var vmax = {
        "start": 1,
        "exit": 1,
        "walls": Infinity,
        "guards": Infinity
    };
    // max number of objects of that type
    var omax = {
        "start": 1,
        "exit": 1,
        "walls": Infinity,
        "guards": Infinity
    };
    var colors = {
        "start": "blue",
        "exit": "brown",
        "walls": "black",
        "guards": "red"
    };
    for (var i = 0; i < types.length; i++) objs[types[i]] = [];
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
        objs = {};
        for (var i = 0; i < types.length; i++) objs[types[i]] = [];
    });

    $('#canvas').mousemove(function(e){
        mousepoint[0] = e.pageX - this.offsetLeft;
        mousepoint[1] = e.pageY - this.offsetTop;
    });

    $('#text').click(function(){

        $('#textbox').val('');
        var data = JSON.stringify(objs)
        $('#textbox').val(data);
    });

    function deactivate(type)
    {
        active = false;
        var currObjs = objs[type];
        if(vmax[type] === 1) {
            objs[type] = newObj;
        }
        else currObjs.push(newObj);
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
        ctx.fillStyle = colors[type];
        ctx.strokeStyle = colors[type];
        for (var i = 0; i < currObjs.length; i++)
        {
            var currObj = currObjs[i];
            if (type === types[0])
            {
                ctx.beginPath();
                ctx.arc(currObj[0], currObj[1], dotRadius, 0, Math.PI*2);
                ctx.closePath();
                ctx.fill();
            }
            else if (type === types[1])
            {
                var thisX = currObj[0];
                var thisY = currObj[1];
                ctx.fillRect(thisX, thisY, stairSize, stairSize);
            }
            else
            {
                ctx.beginPath();
                ctx.moveTo(currObj[0][0], currObj[0][1]);
                for (var j = 1; j < currObj.length; j++)
                {
                    ctx.lineTo(currObj[j][0], currObj[j][1]);
                }
                ctx.closePath();
                if (type != types[3]) ctx.fill();
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
        for(var i = 0; i < types.length; i++)
        {
            drawObj(types[i]);
        }
    }
    document.addEventListener("keyup", keyUpHandler, false);

    setInterval(draw, 10);
});