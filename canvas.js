var canvas, ctx;
var translatePos = {x: 0, y: 0};
var scale = 1.0; 
var rotAngle = 0;
var STEPSIZE = 8;
var img;

function initImage(url)
{
   	var image = new Image();
    image.onload = function()
    {	     
    	draw(image, scale, translatePos);       
    }
    image.src = url;
    return image;
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
		translatePos = addVector( adjustedVector(-1,0,STEPSIZE) , translatePos);
	}
	else if (evt.keyCode == 37 || evt.keyCode == 65){
		translatePos = addVector( adjustedVector(1,0,STEPSIZE) , translatePos);
	}
	else if (evt.keyCode == 38 || evt.keyCode == 87) {
		translatePos = addVector( adjustedVector(0,1,STEPSIZE) , translatePos);
	}
	else if (evt.keyCode == 40 || evt.keyCode == 83) {
		translatePos = addVector( adjustedVector(0,-1,STEPSIZE) , translatePos);
	}
	else if (evt.keyCode == 81) rotAngle += 0.1;
	else if (evt.keyCode == 69) rotAngle -= 0.1;
	
	draw(img, scale, translatePos, rotAngle);
}

function scroll(e) {
    if(e.originalEvent.wheelDelta /120 > 0) {
        scale = scale * 1.2;
   		draw(img, scale, translatePos, rotAngle);   
    }
    else{
        scale = scale / 1.2;
   		draw(img, scale, translatePos, rotAngle);   
    }
}	

function adjustedVector(_x,_y,scale){
	moveVec = rotateVector({x: _x, y: _y},rotAngle);
	return scaleVector(moveVec,scale);	
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


$(document).ready(function() {
	canvas = document.querySelector('canvas');	
	ctx = canvas.getContext('2d');
	 
	canvas.style.width='100%';
	canvas.style.height='100%';
	canvas.width  = $(canvas).parent().width();
	canvas.height = $(canvas).parent().height();

	img = initImage("http://kartarkiv.turebergsif.se/map_images/593.jpg");

	$(canvas).bind('mousewheel', scroll); //TODO: Works only for chrome???
});

$(document).keydown(onKeyDown);
