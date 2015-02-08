paper.install(window);
var canvas, ctx, translatePos, scale, rotAngle, img, movingPoint;
var STEPSIZE = 50;
var ROTSPEED = Math.PI/30;
var SCALESPEED = 1.2;
var translatePos = new Point(0, 0);
var route = {x: [], y: []};
var gpsRoute = false;
var state = "move";
var close = false;
var fade = 0;
var gpsFixedPoints = [];
var cartPoints = {x: [], y: []}; 

function initImage(e){
    img = new Image();
    img.onload = function()
    {	
        $( "#file-input-div" ).hide();  
    	resetCanvas();   
    	fadeDraw();     
        $( "#toolbox" ).show();
    	$(document).keydown(onKeyDown);       
    }
    img.src = e.target.result;
}

function initImageUrl(url){
   	img = new Image();
    img.onload = function()
    {	
        $( "#file-input-div" ).hide();
		resetCanvas();     
    	fadeDraw();
        $( "#toolbox" ).show();
    	$(document).keydown(onKeyDown);
    }
    img.src = url;
}

function resetCanvas(){
   	translatePos = {x: 0, y: 0};
	scale = 1.0; 
	rotAngle = 0;
}

function draw(image, scale, translatePos, rotAngle) { // Draw it
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    setView();
	ctx.drawImage(image, -image.width / 2, -image.height / 2);
    drawPath()
	ctx.restore();
}

function fadeDraw() { 
    if (fade > 100) {
            return;
    }
    requestAnimationFrame( fadeDraw); 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    setView();
    ctx.globalAlpha = fade/100;
    ctx.drawImage(img, -img.width / 2, -img.height / 2);
    drawPath()
    ctx.restore();   
    fade++;
}


function setView(){
    ctx.translate(canvas.width / 2, canvas.height / 2);  
    ctx.rotate(rotAngle);
    ctx.scale(scale,scale); 
    ctx.translate(translatePos.x,translatePos.y);  
}

function drawPath() {
    ctx.beginPath(); 
    ctx.lineWidth="4";
    ctx.strokeStyle="red";
    ctx.lineJoin="round";
    ctx.moveTo(route.x[0],route.y[0]);
    for (i = 1; i < route.x.length; i++){
        ctx.lineTo(route.x[i],route.y[i]);
    }    
    ctx.stroke();
    if(state=="draw"){
        if(gpsRoute){
            for (i = 0; i < gpsFixedPoints.length; i++){
                drawPoint(route.x[gpsFixedPoints[i]],route.y[gpsFixedPoints[i]], 2);
            }
        } else {
            for (i = 0; i < route.x.length; i++){
                drawPoint(route.x[i],route.y[i], 2);
            }
        }
    }

   
}

function drawPoint(px,py,size) {
    ctx.lineWidth="3";
    ctx.strokeStyle="black";
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(px,py, size, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

function onKeyDown(evt) {
	if (evt.keyCode == 39 || evt.keyCode == 68){
		step("right");
	}
	else if (evt.keyCode == 37 || evt.keyCode == 65){
		step("left");
	}
	else if (evt.keyCode == 38 || evt.keyCode == 87) {
		step("up");
	}
	else if (evt.keyCode == 40 || evt.keyCode == 83) {
		step("down");
	}
	else if (evt.keyCode == 81) rotate("right");
	else if (evt.keyCode == 69) rotate("left");
	else if (evt.keyCode == 32) {
        resetCanvas();
        draw(img, scale, translatePos, rotAngle);
    }
}

function rotate(dir){
    if (dir=="right"){
        rotAngle += ROTSPEED;
    }
    else if (dir=="left"){
        rotAngle -= ROTSPEED;
    }
    draw(img, scale, translatePos, rotAngle);
}

function step(dir){
    if (dir=="right"){
        translatePos = fromWindowToCanvas(new Point(-1,0)).multiply(STEPSIZE).add(translatePos);
    }
    else if (dir=="left"){
        translatePos = fromWindowToCanvas(new Point(1,0)).multiply(STEPSIZE).add(translatePos);
    }
    else if (dir=="up") {
        translatePos = fromWindowToCanvas(new Point(0,1)).multiply(STEPSIZE).add(translatePos);
    }
    else if (dir=="down") {
        translatePos = fromWindowToCanvas(new Point(0,-1)).multiply(STEPSIZE).add(translatePos);
    }
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

function fromWindowToCanvas(vector){
    //Adjust moving vector to canvas orientation
	return vector.rotate(-rotAngle*180/Math.PI,new Point(0,0)).divide(scale);
}
	
function mouseMove(e){
	translatePos = fromWindowToCanvas(new Point(e.pageX-x,e.pageY-y)).add(translatePos);
	x = e.pageX;
	y = e.pageY;
	draw(img, scale, translatePos, rotAngle);
}

function mouseMoveDraw(e){
    mousePoint = new Point(e.pageX - canvas.width / 2, e.pageY - canvas.height / 2);
    mousePoint = fromWindowToCanvas(mousePoint);
    mousePoint = mousePoint.subtract(translatePos);
    routePoint = findClosestPoint(route,mousePoint);
    if(routePoint.dist < 15 / scale){
        draw(img, scale, translatePos, rotAngle);
        ctx.save();
        setView();
        drawPoint(route.x[routePoint.idx],route.y[routePoint.idx],4);
        ctx.restore();        
        close = true;
    } else if (close == true){
        draw(img, scale, translatePos, rotAngle);
        close = false; 
    }   
}

function mouseMovePoint(e){
    routePoint = new Point(e.pageX - canvas.width / 2, e.pageY - canvas.height / 2)
    routePoint = fromWindowToCanvas(routePoint)
    routePoint = routePoint.subtract(translatePos)
    route.x[movingPoint.idx] = routePoint.x;
    route.y[movingPoint.idx] = routePoint.y;
    recalcPath();
    draw(img, scale, translatePos, rotAngle);
    ctx.save();
    setView();
    drawPoint(route.x[movingPoint.idx],route.y[movingPoint.idx],4);
    ctx.restore();
}

function recalcPath(){
    if(gpsFixedPoints.length == 1){
        console.log('ok');
        dx = route.x[gpsFixedPoints[0]] - cartPoints.x[gpsFixedPoints[0]];
        dy = route.y[gpsFixedPoints[0]] - cartPoints.y[gpsFixedPoints[0]];
        console.log(dx);
        for(var i = 0; i < route.x.length; i++){
            if(i != gpsFixedPoints[0]){
                route.x[i] = cartPoints.x[i] + dx;
                route.y[i] = cartPoints.y[i] + dy;
            }
        }
    } else if(gpsFixedPoints.length > 1){
        for(var j = 0; j < gpsFixedPoints.length; j++){
            if(j == 0){
                if (gpsFixedPoints[j] != 0) {
                    transformSegment(0,gpsFixedPoints[j],gpsFixedPoints[j],gpsFixedPoints[j+1]);
                    console.log('1')
                }
            } else {
                transformSegment(gpsFixedPoints[j-1],gpsFixedPoints[j],gpsFixedPoints[j-1],gpsFixedPoints[j]);
                console.log('2')
            }
            if (j == gpsFixedPoints.length - 1 && gpsFixedPoints[j] != route.x.length-1) {
                transformSegment(gpsFixedPoints[j],route.x.length-1,gpsFixedPoints[j-1],gpsFixedPoints[j]);
                console.log('3')
            }
        }
    }
}

function transformSegment(from,to,firstFixed,secFixed){
    dx = cartPoints.x[secFixed]-cartPoints.x[firstFixed];
    dy = cartPoints.y[secFixed]-cartPoints.y[firstFixed];
    abs = Math.sqrt(dx*dx+dy*dy);
    dx = route.x[secFixed]-route.x[firstFixed];
    dy = route.y[secFixed]-route.y[firstFixed];
    scaleDiff = Math.sqrt(dx*dx+dy*dy)/abs;
    ang1 = Math.atan2((cartPoints.y[secFixed]-cartPoints.y[firstFixed]),(cartPoints.x[secFixed]-cartPoints.x[firstFixed]));
    ang2 = Math.atan2((route.y[secFixed]-route.y[firstFixed]),(route.x[secFixed]-route.x[firstFixed]));
    ang = ang1-ang2;
    console.log(ang);
    for (var i=from; i <= to ; i++) {
        xvec = cartPoints.x[i] - cartPoints.x[firstFixed];
        yvec = cartPoints.y[i] - cartPoints.y[firstFixed];
        route.x[i] = route.x[firstFixed] + (Math.cos(ang)*xvec+Math.sin(ang)*yvec)*scaleDiff;
        route.y[i] = route.y[firstFixed] + (-Math.sin(ang)*xvec+Math.cos(ang)*yvec)*scaleDiff;
    }
}

function setState(newState, element){
    state = newState;    
    $("#toolbox i").css("color", "black");
    element.style.color = "#006dcc";
    draw(img, scale, translatePos, rotAngle); 
    if(state == "draw"){
        canvas.onmousemove = mouseMoveDraw; 
    } else {
        canvas.onmousemove = null;
    }
}

function mouseDown(e){
    if(state == "move"){
        x = e.pageX;
        y = e.pageY;
        canvas.onmousemove = mouseMove;
    } else if(state == "draw"){
        if(gpsRoute){
            var mousePoint = new Point(e.pageX - canvas.width / 2, e.pageY - canvas.height / 2);
            mousePoint = fromWindowToCanvas(mousePoint);
            mousePoint = mousePoint.subtract(translatePos);
            movingPoint = findClosestPoint(route,mousePoint);
            if($.inArray(movingPoint.idx,gpsFixedPoints) == -1){
                console.log('ok');
                gpsFixedPoints = sortedInsert(gpsFixedPoints,movingPoint.idx);
            }
            canvas.onmousemove = mouseMovePoint;
        } else if(e.ctrlKey){
            removeClosestPoint(e); 
        } else {
            addRoutePoint(e);
        }            
    }
}

function sortedInsert(array,obj){
    if(array.length == 0 || obj > array[array.length-1]) {
        array.push(obj);
        return array;
    } else {
        for(var i=0; i < array.length; i++){
            if(obj < array[i]){
                a1 = array.slice(0,i);
                a1.push(obj);
                a2 = array.slice(i,array.length);
                console.log(a1);
                console.log(a2);
                array = a1.concat(a2);
                return array;
            }
        }
    }
}

function mouseUp(){ 
    if(state == "move"){
        canvas.onmousemove = null;
    }
    if(state == "draw"){
        canvas.onmousemove = mouseMoveDraw;
    }
    draw(img, scale, translatePos, rotAngle);
}

function addRoutePoint(e){
  routePoint = new Point(e.pageX - canvas.width / 2, e.pageY - canvas.height / 2)
  routePoint = fromWindowToCanvas(routePoint)
  routePoint = routePoint.subtract(translatePos)
  route.x[route.x.length] = routePoint.x;
  route.y[route.y.length] = routePoint.y;
  draw(img, scale, translatePos, rotAngle);
}

function removeClosestPoint(e){
    mousePoint = new Point(e.pageX - canvas.width / 2, e.pageY - canvas.height / 2);
    mousePoint = fromWindowToCanvas(mousePoint);
    mousePoint = mousePoint.subtract(translatePos);
    routePoint = findClosestPoint(route,mousePoint);
    if(routePoint.dist < 15 / scale){
        removeRoutepoint(routePoint.idx);
        draw(img, scale, translatePos, rotAngle);
    }
}

function removeRoutepoint(point) {
    route.x.splice(point,1);
    route.y.splice(point,1);
    draw(img, scale, translatePos, rotAngle);
}

function findClosestPoint(path,point) {
    minDist = Infinity;
    minIdx = -1;
    for (i = 0; i < path.x.length; i++){
        dist = squareDist(path.x[i],path.y[i],point.x,point.y);
        if(dist < minDist){
            minDist = dist;
            minIdx = i;
        }
    }
    return {idx: minIdx, dist: minDist}; 
}

function squareDist(xa,ya,xb,yb){
    xd = xa - xb;
    yd = ya - yb;
    return Math.sqrt(xd*xd + yd*yd);
}

$(document).ready(function() {
	canvas = document.querySelector('canvas');	
	ctx = canvas.getContext('2d');
	 
	canvas.style.width='100%';
	canvas.style.height='100%';
    canvas.width  = $(canvas).parent().width();
    canvas.height = $(canvas).parent().height();
	

    $( window ).resize(function() {
        canvas.width  = $(canvas).parent().width();
        canvas.height = $(canvas).parent().height();
        draw(img, scale, translatePos, rotAngle);
    });

	$(canvas).bind('mousewheel', scroll); //TODO: Works only for chrome???

	canvas.onmousedown = mouseDown;
	canvas.onmouseup = mouseUp;

    $('#gpx-input').change(function() {
       $('#gpxLabel').html(extractFileName($('#gpx-input').val()));      
    });

    $('#file-input').change(function() {
       $('#imgLabel').html(extractFileName($('#file-input').val()));      
    });  

});

function initCanvas(){
    if($('[name=routeRadio]:checked').val() == "gps") {
        var file = $('#gpx-input')[0].files[0];
        reader = new FileReader;
        reader.onload = initGPX;
        reader.readAsText(file);
    }
    if($('[name=routeRadio]:checked').val() == "manual") {};
    if($('[name=mapRadio]:checked').val() == "file") {

        //$( "#file-input-div" ).html("<h3>Loading image...</h3>");
        var file = $('#file-input')[0].files[0],
            imageType = /image.*/;
        
        if (!file.type.match(imageType))
            return;
        
        var reader = new FileReader();
        reader.onload = initImage;
        reader.readAsDataURL(file);
    }
    if($('[name=mapRadio]:checked').val() == "url") {
        initImageUrl($("#image-url").val());
    }
}

function initGPX(e){
    var gpxPoints = {lat: [], lon: []};
    var parsed = new DOMParser().parseFromString(e.target.result, "text/xml");

    //Get trackpoints
    $(parsed).find('trkpt').each(function(){
        gpxPoints.lat.push(parseFloat($(this).attr('lat')));
        gpxPoints.lon.push(parseFloat($(this).attr('lon')));
    });

    //Convert to cartesian (simple)
    for (var i=gpxPoints.lat.length-1; i>=0; i--) {
        var y = ((-1 * gpxPoints.lat[i]) + 90) / 180;
        var x = (gpxPoints.lon[i] + 180) / 360;
        cartPoints.x.push(x);
        cartPoints.y.push(y);
    };

    //================
    //Transform to map
    //================
    var ymin = Number.POSITIVE_INFINITY;
    var ymax = Number.NEGATIVE_INFINITY;
    var xmin = Number.POSITIVE_INFINITY;
    var xmax = Number.NEGATIVE_INFINITY;
    var ytmpx, xtmp;
    
    //Find extremepoints 
    for (var i=cartPoints.x.length-1; i>=0; i--) {
        xtmp = cartPoints.x[i];
        ytmp = cartPoints.y[i];
        if (xtmp < xmin) xmin = xtmp;
        if (xtmp > xmax) xmax = xtmp;
        if (ytmp < ymin) ymin = ytmp;
        if (ytmp > ymax) ymax = ytmp;
    }

    //Transform
    for (var i=cartPoints.x.length-1; i>=0; i--) {
        var u = (xmax - cartPoints.x[i])/(xmax-xmin);
        var v = (ymax - cartPoints.y[i])/(ymax-ymin);
        cartPoints.x [i]= -(u*0.45*canvas.height) + ((1-u)*0.45*canvas.height);
        cartPoints.y[i] = -(v*0.45*canvas.height) + ((1-v)*0.45*canvas.height);
    }
    //Draw
    route = jQuery.extend(true, {}, cartPoints);

    gpsRoute = true;
} 

function extractFileName(fullPath){
    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
    var filename = fullPath.substring(startIndex);
    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
    }
    return filename
}



function saveModal(){
    $( ".modal-title" ).html("Save");
    $( ".modal-body" ).html("Right click on the map and choose ''Save image as...'' to save the map.");
    $('#myModal').modal('show');
}
