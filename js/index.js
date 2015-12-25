var route = [];
var gpsRoute = false;
var gpsFixedPoints = [];

function squareDist(xa,ya,xb,yb){
    xd = xa - xb;
    yd = ya - yb;
    return Math.sqrt(xd*xd + yd*yd);
}

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

    for (var i=0; i<gpxPoints.lat.length; i++) {
        route[i] = new Object();
        route[i].lat = gpxPoints.lat[i];
        route[i].lon = gpxPoints.lon[i];
        route[i].t = new Date(gpxPoints.t[i]).getTime()/1000 - startTime;
    }
} 

function extractFileName(fullPath){
    var startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
    var filename = fullPath.substring(startIndex);
    if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
        filename = filename.substring(1);
    }
    return filename
}