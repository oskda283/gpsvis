var route = new Object();
google.load('visualization', '1.0', {'packages':['corechart']});

$(document).ready(function() {

    $('#gpx-input').change(function() {
       //$('#gpxLabel').html(extractFileName($('#gpx-input').val()));
       //$('#startButton').show();
       init();
    });

});

function init(){
    var file = $('#gpx-input')[0].files[0];
    reader = new FileReader;
    reader.onload = initGPX;
    reader.readAsText(file);
}

function initGPX(e){
    route.routePoints = [];
    var parsed = new DOMParser().parseFromString(e.target.result, "text/xml");
    var trackpoints = $(parsed).find('trkpt');
    var startTime= new Date($(trackpoints).first().find('time').text()).getTime()/1000;

    $(trackpoints).each(function(){
        point = new Object();
        point.lat = parseFloat($(this).attr('lat'));
        point.lon = parseFloat($(this).attr('lon'));
        point.t = new Date($(this).find('time').text()).getTime()/1000 - startTime;
        point.ele = parseFloat($(this).find('ele').text());
        route.routePoints.push(point);
    });

    for (var i=0; i<route.routePoints.length; i++) {
        route.routePoints[i].d = (i == 0 ? 0 : route.routePoints[i-1].d + getDistanceBetweenPoints(i-1,i));
        if(i == 1) {
            route.routePoints[0].v = getSecondsPerKm(route.routePoints[0], route.routePoints[1])
        } else if(i > 1){
            route.routePoints[i-1].v = getSecondsPerKm(route.routePoints[i-2], route.routePoints[i]);
        }
        if(i == route.routePoints.length - 1) {
            route.routePoints[i].v = getSecondsPerKm(i-1,i);
        }
    }

    route.totalTime = calcSeconds(0,route.routePoints.length - 1);
    route.totalDistance = calcDistance(0,route.routePoints.length - 1);
    route.averageSpeed  = calcAverageSecondsPerKm(0,route.routePoints.length - 1);
    afterInit();
}

function afterInit(){
    $('#file-input-div').hide();
    showOverview();
    drawCharts();
}

function drawCharts(){
    drawBasicChart();
}

function drawBasicChart(){

    $('#chart1').show();
    var dataArray = []
    dataArray.push(['Time', 'Speed']);
    console.log(dataArray);
    for(var i=0; i<route.routePoints.length; i++){
        dataArray.push([new Date(0,0,0,0,0,route.routePoints[i].t,0), new Date(0,0,0,0,0,route.routePoints[i].v,0)]);
    }

    var data = google.visualization.arrayToDataTable(dataArray);
    var options = {
          title: 'Speed',
          curveType: 'function',
          legend: { position: 'bottom' }
    };
    var chart = new google.visualization.LineChart(document.getElementById('basic-chart'));

    chart.draw(data, options);
}

function showOverview(){
    $('#totalTime').html(secondsToTimeString(route.totalTime))
    $('#totalDistance').html(distanceToTimeString(route.totalDistance))
    $('#avgSpeed').html(secondsToTimeString(route.averageSpeed))
    $('#overview').show()
}

function extractFileName(fullPath){
    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
    var filename = fullPath.substring(startIndex);
    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
    }
    return filename
}

function squareDist(xa,ya,xb,yb){
    xd = xa - xb;
    yd = ya - yb;
    return Math.sqrt(xd*xd + yd*yd);
}

function calcSeconds(startIdx, endIdx) {
    return route.routePoints[endIdx].t - route.routePoints[startIdx].t;
}

function calcDistance(startIdx, endIdx) {
    return route.routePoints[endIdx].d - route.routePoints[startIdx].d;
}

function calcAverageSecondsPerKm(startIdx, endIdx) {
    return calcSeconds(startIdx, endIdx)/calcDistance(startIdx, endIdx);
}

function secondsToTimeString(timeInSeconds) {
    var hours = Math.floor(timeInSeconds/3600);
    var minutes = zeropad(Math.floor((timeInSeconds % 3600)/60));
    var seconds = zeropad(Math.floor(timeInSeconds % 60));
    return (hours > 0 ? hours + ":" : "") + minutes + ":" + seconds;
}

function distanceToTimeString(distanceInKm) {
    var meters = Math.floor(distanceInKm * 1000)
    return meters + " m";
}

function zeropad(number){
    if(number < 10){
        number = '0' + number;
    }
    return number
}

function getSecondsPerKm(point1, point2){
    return (point2.t - point1.t)/(point2.d - point1.d);   
}

function getDistanceBetweenPoints(startIdx, endIdx){
    var routePoints = route.routePoints;
    return getDistanceFromLatLonInKm(
        routePoints[startIdx].lat, routePoints[startIdx].lon,
        routePoints[endIdx].lat, routePoints[endIdx].lon);
}

function getDistanceFromLatLonInKm(lat1,lon1,lat2,lon2) { 
  var R = 6371; // Radius of the earth in km. Function assumes perfect square
  var dLat = deg2rad(lat2-lat1);  // deg2rad below
  var dLon = deg2rad(lon2-lon1); 
  var a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2)
    ; 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c; // Distance in km
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI/180)
}