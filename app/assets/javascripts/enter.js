if (navigator.geolocation) {
  monitorPosition();
	//navigator.geolocation.getCurrentPosition(success, error);
} else {
	error('not supported');
}

Pusher.channel_auth_endpoint = '/login/auth';
var pusher = new Pusher('0b7f4e07db19c4ba312d');
var channel = pusher.subscribe('presence-map-channel');

channel.bind('pusher:subscription_succeeded', function(members) {

});

channel.bind('pusher:member_added', function(member) {

});

channel.bind('pusher:member_removed', function(member) {

});



channel.bind('client-123', function(member) {
  console.log('yes');
});


var lastlat = 0, lastlon = 0;

function monitorPosition() {
  navigator.geolocation.getCurrentPosition(function(position) {
    var lat = position.coords.latitude, lon = position.coords.longitude;
    if (lastlat != 0 && lastlon != 0) {
      alert(1000*distance(lat, lon, lastlat, lastlon));
      //alert(lat + " " + lon);
    }
    lastlat = lat;
    lastlon = lon;
    setTimeout(monitorPosition, 3000);
  }, function() {
    alert('error');
  });
}


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
//:::                                                                         :::
//:::  This routine calculates the distance between two points (given the     :::
//:::  latitude/longitude of those points). It is being used to calculate     :::
//:::  the distance between two locations using GeoDataSource (TM) prodducts  :::
//:::                                                                         :::
//:::  Definitions:                                                           :::
//:::    South latitudes are negative, east longitudes are positive           :::
//:::                                                                         :::
//:::  Passed to function:                                                    :::
//:::    lat1, lon1 = Latitude and Longitude of point 1 (in decimal degrees)  :::
//:::    lat2, lon2 = Latitude and Longitude of point 2 (in decimal degrees)  :::
//:::    unit = the unit you desire for results                               :::
//:::           where: 'M' is statute miles                                   :::
//:::                  'K' is kilometers (default)                            :::
//:::                  'N' is nautical miles                                  :::
//:::                                                                         :::
//:::  Worldwide cities and other features databases with latitude longitude  :::
//:::  are available at http://www.geodatasource.com                          :::
//:::                                                                         :::
//:::  For enquiries, please contact sales@geodatasource.com                  :::
//:::                                                                         :::
//:::  Official Web site: http://www.geodatasource.com                        :::
//:::                                                                         :::
//:::               GeoDataSource.com (C) All Rights Reserved 2012            :::
//:::                                                                         :::
//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::

function distance(lat1, lon1, lat2, lon2) {
  var radlat1 = Math.PI * lat1/180;
  var radlat2 = Math.PI * lat2/180;
  var radlon1 = Math.PI * lon1/180;
  var radlon2 = Math.PI * lon2/180;
  var theta = lon1-lon2;
  var radtheta = Math.PI * theta/180;
  var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
  dist = Math.acos(dist);
  dist = dist * 180/Math.PI;
  dist = dist * 60 * 1.1515;

  unit = "K";
  if (unit=="K") { dist = dist * 1.609344; }
  if (unit=="N") { dist = dist * 0.8684; }
  return dist;
}       

rad = function(x) {return x*Math.PI/180;}

function distance2(lat1, lon1, lat2, lon2) {
  var R = 6371; // Radius of the Earth in km
  var dLat = rad(lat1 - lat2) * Math.PI / 180;
  var dLon = rad(lon1 - lon2) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d;
};                                                                    



function error(msg) {
	alert("error!");
}

function success(position) {
  var mapcanvas = document.createElement('div');
  mapcanvas.id = 'mapcanvas';
  var map_width = $('#map_container').width() * 0.8,
  		map_height = map_width * 0.8;
  mapcanvas.style.width = map_width + 'px';
  mapcanvas.style.height = map_height + 'px';
    
  $('#map_container').append(mapcanvas);
  
  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var myOptions = {
    zoom: 18,
    center: latlng,
    mapTypeControl: false,
    navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  var map = new google.maps.Map(document.getElementById("mapcanvas"), myOptions);
  
  var marker = new google.maps.Marker({
      position: latlng, 
      map: map, 
      title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
  });

  // var marker2 = new google.maps.Marker({
  //     position: new google.maps.LatLng(position.coords.latitude+0.001, position.coords.longitude+0.001),
  //     map: map, 
  //     title:"You are here! (at least within a "+position.coords.accuracy+" meter radius)"
  // });

}