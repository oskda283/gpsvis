var route = new Object();

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
    var gpxPoints = {lat: [], lon: [], t: []};
    var parsed = new DOMParser().parseFromString(e.target.result, "text/xml");

    //Get trackpoints
    $(parsed).find('trkpt').each(function(){
        gpxPoints.lat.push(parseFloat($(this).attr('lat')));
        gpxPoints.lon.push(parseFloat($(this).attr('lon')));
        gpxPoints.t.push($(this).find('time').text());
    });

    var startTime= new Date(gpxPoints.t[0]).getTime()/1000;

    route.routePoints = [];

    for (var i=0; i<gpxPoints.lat.length; i++) {
        route.routePoints[i] = new Object();
        route.routePoints[i].lat = gpxPoints.lat[i];
        route.routePoints[i].lon = gpxPoints.lon[i];
        route.routePoints[i].t = new Date(gpxPoints.t[i]).getTime()/1000 - startTime;
        route.routePoints[i].d = (i == 0 ? 0 : route.routePoints[i-1].d + getDistanceBetweenPoints(i-1,i))
    }

    route.totalTime = calcSeconds(0,route.routePoints.length - 1);
    route.totalDistance = calcDistance(0,route.routePoints.length - 1);
    afterInit();
}

function afterInit(){
    $('#file-input-div').hide();
    showOverview();
}

function showOverview(){
    $('#totalTime').html(secondsToTimeString(route.totalTime))
    $('#totalDistance').html(distanceToTimeString(route.totalDistance))
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

function secondsToTimeString(timeInSeconds) {
    var hours = Math.floor(timeInSeconds/3600);
    var minutes = zeropad(Math.floor((timeInSeconds % 3600)/60));
    var seconds = zeropad(Math.floor(timeInSeconds % 60));
    return hours + ":" + minutes + ":" + seconds;
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