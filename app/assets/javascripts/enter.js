// global variables
var MAPCANVAS;
var Members = new Array();
var RADIUS = 50;
var My_marker;

// get username
var NAME;

$(document).ready(function() {
  NAME = $('#username').text();
  $('#radius_display_block').text("My radar: " + RADIUS.toFixed(0) + "m");
  if (navigator.geolocation) {
    setupChannel();
    setupMap(); //monitorPosition after successfully setup map!
  } else {
  	alert('Please turn on location service');
  }
});

// set up channel
function setupChannel() {
  Pusher.channel_auth_endpoint = '/login/auth';
  var pusher = new Pusher('0b7f4e07db19c4ba312d');
  var channel = pusher.subscribe('presence-map-channel');

  channel.bind('pusher:subscription_succeeded', function(members) {

  });

  channel.bind('pusher:member_added', function(member) {

  });

  channel.bind('pusher:member_removed', function(member) {
    for (var i = 0; i < Members.length; i++) {
      if (Members[i].id == member.id) {
        Members[i].marker.setMap(null);
        Members.splice(i, 1);
        break;
      }
    }
  });

  // event for updating postions
  channel.bind('updateMap', function(data) {
    var who = data.name, id = data.id, lat = data.latitude, lon = data.longitude;
    console.log(who + " " + lat + " " + lon);
    var latlng = new google.maps.LatLng(lat, lon);

    // update the i-th member's info
    var i;
    for (i = 0; i < Members.length; i++) {
      if (Members[i].id == id) {
        Members[i].marker.setPosition(latlng);
        // others, should check distance
        if (who != NAME) {
          if (RADIUS >= myDistance(My_marker.getPosition(), Members[i].marker.getPosition())) {
            console.log(Members[i].name + " is near!");
          }
        }
        break;
      }
    }

    // if member not found
    if (i == Members.length) {
      var marker = new google.maps.Marker({
        position: latlng, 
        map: MAPCANVAS
      });
      var memberinfo;

      // add member, if member is self, add a distanceWidget
      if (who == NAME) {
        My_marker = marker;
        var distanceWidget = new DistanceWidget(MAPCANVAS, marker);
        google.maps.event.addListener(distanceWidget, 'distance_changed', function() {
          RADIUS = distanceWidget.get('distance');
          $('#radius_display_block').text("My radar: " + RADIUS.toFixed(0) + "m");
        });
        memberinfo = {name: who, id: id, marker: marker, latitude: lat, longitude: lon, widget: distanceWidget};
      } else {
        memberinfo = {name: who, id: id, marker: marker, latitude: lat, longitude: lon};
      } 
      Members.push(memberinfo);
    }

  });
}

// set up map canvas
function setupMap() {
  //console.log("here");
  navigator.geolocation.getCurrentPosition(function(position) {
    var mapcanvas = document.createElement('div');
    mapcanvas.id = 'mapcanvas';
    var map_width = $(window).width() * 1,
    map_height = $(window).height() * 0.75;
    mapcanvas.style.width = map_width + 'px';
    mapcanvas.style.height = map_height + 'px';
    $('#map_container').append(mapcanvas);
    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var options = {
      zoom: 17,
      center: latlng,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    MAPCANVAS = new google.maps.Map(document.getElementById("mapcanvas"), options);
    monitorPosition();
  }, error);
}


// monitor function
var lastlat = 0, lastlon = 0;
function monitorPosition() {
  navigator.geolocation.getCurrentPosition(function(position) {
    var lat = position.coords.latitude, lon = position.coords.longitude;
    if (lastlat != 0 && lastlon != 0) {
      //alert(1000*distance(lat, lon, lastlat, lastlon));
      //alert(lat + " " + lon);
    }
    lastlat = lat;
    lastlon = lon;
    sendPosition(lat, lon);
  }, function() {
    alert('error');
  });
}

// send current position to server
function sendPosition(lat, lon) {
  $.ajax({
    type: "POST",
    url : "/pos",
    cache: false,
    data: {latitude: lat, longitude: lon},
    success: function() {  setTimeout(monitorPosition, 3000); },
    error: function(xhr){  alert("sendPosition error"); }        
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

function error() {
	alert('error!');
}



function DistanceWidget(map, marker) {
  this.set('map', map);
  this.set('position', marker.getPosition());

  //var marker = new google.maps.Marker({ draggable: true });

  // Bind the marker map property to the DistanceWidget map property
  marker.bindTo('map', this);

  // Bind the marker position property to the DistanceWidget position
  // property
  marker.bindTo('position', this);

  var radiusWidget = new RadiusWidget();

  // Bind the radiusWidget map to the DistanceWidget map
  radiusWidget.bindTo('map', this);

  // Bind the radiusWidget center to the DistanceWidget position
  radiusWidget.bindTo('center', this, 'position');

  // Bind to the radiusWidgets' distance property
  this.bindTo('distance', radiusWidget);

  // Bind to the radiusWidgets' bounds property
  this.bindTo('bounds', radiusWidget);
}
DistanceWidget.prototype = new google.maps.MVCObject();

function RadiusWidget() {
  var circle = new google.maps.Circle({
    strokeWeight: 2
  });

  // Set the distance property value, default to 10m.
  this.set('distance', RADIUS);

  // Bind the RadiusWidget bounds property to the circle bounds property.
  this.bindTo('bounds', circle);

  // Bind the circle center to the RadiusWidget center property
  circle.bindTo('center', this);

  // Bind the circle map to the RadiusWidget map
  circle.bindTo('map', this);

  // Bind the circle radius property to the RadiusWidget radius property
  circle.bindTo('radius', this);

  this.addSizer_();
}
RadiusWidget.prototype = new google.maps.MVCObject();

RadiusWidget.prototype.distance_changed = function() {
  this.set('radius', this.get('distance'));
};

RadiusWidget.prototype.addSizer_ = function() {
  var sizer = new google.maps.Marker({
    draggable: true,
    title: 'Drag me!'
  });

  sizer.bindTo('map', this);
  sizer.bindTo('position', this, 'sizer_position');
  var me = this;
  google.maps.event.addListener(sizer, 'drag', function() {
    // Set the circle distance (radius)
    me.setDistance();
  });
};

RadiusWidget.prototype.center_changed = function() {
  var bounds = this.get('bounds');

  // Bounds might not always be set so check that it exists first.
  if (bounds) {
    var lng = bounds.getNorthEast().lng();

    // Put the sizer at center, right on the circle.
    var position = new google.maps.LatLng(this.get('center').lat(), lng);
    this.set('sizer_position', position);
  }
};

RadiusWidget.prototype.distanceBetweenPoints_ = function(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000;
};

RadiusWidget.prototype.setDistance = function() {
  // As the sizer is being dragged, its position changes.  Because the
  // RadiusWidget's sizer_position is bound to the sizer's position, it will
  // change as well.
  var pos = this.get('sizer_position');
  var center = this.get('center');
  var distance = this.distanceBetweenPoints_(center, pos);

  // Set the distance property for any objects that are bound to it
  this.set('distance', distance);
};

function myDistance(p1, p2) {
  if (!p1 || !p2) {
    return 0;
  }

  var R = 6371; // Radius of the Earth in km
  var dLat = (p2.lat() - p1.lat()) * Math.PI / 180;
  var dLon = (p2.lng() - p1.lng()) * Math.PI / 180;
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(p1.lat() * Math.PI / 180) * Math.cos(p2.lat() * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;
  return d * 1000;
}


// for reference
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

}