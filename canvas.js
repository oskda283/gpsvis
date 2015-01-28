var canvas, ctx, translatePos, scale, rotAngle, img;
var STEPSIZE = 50;
var ROTSPEED = Math.PI/30;
var SCALESPEED = 1.2;

function initImage(e)
{
   	img = new Image();
    img.onload = function()
    {	  
    	resetCanvas();   
    	draw(img, scale, translatePos);
    	$( "#file-input-div" ).hide();
    	$(document).keydown(onKeyDown);       
    }
    img.src = e.target.result;
}

function initImageUrl(url)
{
	
   	img = new Image();
    img.onload = function()
    {	
		resetCanvas();     
    	draw(img, scale, translatePos);
    	$( "#file-input-div" ).hide();
    	$(document).keydown(onKeyDown);       
    }
    img.src = url;
}



function resetCanvas()
{
   	translatePos = {x: 0, y: 0};
	scale = 1.0; 
	rotAngle = 0;
}

function draw(image, scale, translatePos, rotAngle) {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(canvas.width / 2, canvas.height / 2);  
    ctx.rotate(rotAngle);
    ctx.scale(scale,scale);	
    ctx.translate(translatePos.x,translatePos.y);  
	ctx.drawImage(image, -image.width / 2, -image.height / 2);
	ctx.restore();
}


function onKeyDown(evt) {
	if (evt.keyCode == 39 || evt.keyCode == 68){
		translatePos = addVector( scaleVector(adjustedVector(-1,0),STEPSIZE) , translatePos);
	}
	else if (evt.keyCode == 37 || evt.keyCode == 65){
		translatePos = addVector( scaleVector(adjustedVector(1,0),STEPSIZE) , translatePos);
	}
	else if (evt.keyCode == 38 || evt.keyCode == 87) {
		translatePos = addVector( scaleVector(adjustedVector(0,1),STEPSIZE) , translatePos);
	}
	else if (evt.keyCode == 40 || evt.keyCode == 83) {
		translatePos = addVector( scaleVector(adjustedVector(0,-1),STEPSIZE) , translatePos);
	}
	else if (evt.keyCode == 81) rotAngle += ROTSPEED;
	else if (evt.keyCode == 69) rotAngle -= ROTSPEED;
	else if (evt.keyCode == 32) resetCanvas();
	
	draw(img, scale, translatePos, rotAngle);
}

function scroll(e) {
    if(e.originalEvent.wheelDelta /120 > 0) {
        scale = scale * SCALESPEED;
        scale=Math.min(scale,20);
   		draw(img, scale, translatePos, rotAngle);   
    }
    else{
        scale = scale / SCALESPEED;
        scale=Math.max(scale,0.05);
   		draw(img, scale, translatePos, rotAngle);   
    }
}	

function adjustedVector(_x,_y){
	moveVec = rotateVector({x: _x, y: _y},rotAngle);
	return scaleVector(moveVec,1/scale);	
}

function rotateVector(vector, rotAangle){
	return {x: vector.x * Math.cos(rotAngle) + vector.y * Math.sin(rotAngle),
			y: -vector.x * Math.sin(rotAngle) + vector.y * Math.cos(rotAngle)};
}

function scaleVector(vector,scale){
	return {x: vector.x * scale,
			y: vector.y * scale}
}

function addVector(vector1, vector2){
	return {x: vector1.x + vector2.x,
			y: vector1.y + vector2.y}
}
	
function mouseMove(e){
	translatePos = addVector( adjustedVector(e.pageX-x,e.pageY-y) , translatePos);
	x = e.pageX;
	y = e.pageY;
	draw(img, scale, translatePos, rotAngle);
}

function mouseDown(e){
  x = e.pageX;
  y = e.pageY;
  drag = true;
  canvas.onmousemove = mouseMove;
 //}
}

function mouseUp(){
 canvas.onmousemove = null; 
}


$(document).ready(function() {
	canvas = document.querySelector('canvas');	
	ctx = canvas.getContext('2d');
	 
	canvas.style.width='100%';
	canvas.style.height='100%';
	canvas.width  = $(canvas).parent().width();
	canvas.height = $(canvas).parent().height();

	$(canvas).bind('mousewheel', scroll); //TODO: Works only for chrome???

	canvas.onmousedown = mouseDown;
	canvas.onmouseup = mouseUp;

	$('#file-input').change(function(e) {
        var file = e.target.files[0],
            imageType = /image.*/;
        
        if (!file.type.match(imageType))
            return;
        
        var reader = new FileReader();
        reader.onload = initImage;
        reader.readAsDataURL(file);
        
    });
});

