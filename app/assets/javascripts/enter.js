// global variables
var MAPCANVAS;
var Members; // for map
var Members_list; // for list
var RADIUS;
var My_marker;
var pusher;

// get username
var NAME;


$(document).ready(function() {
  
  // loading widget
  $.mobile.loading('show', {
    text: 'Loading...',
    textVisible: true,
    theme: 'a',
    html: ""
  });

  // detecting shaking
  window.addEventListener('shake', shakeIt, false);
  
  // init jrumble
  $('#content_container').jrumble({
    speed: 40,
    rotation: 6
  });
  
  // init chat settings
  $('#send_message_button').click(sendMessage);
  $('#input_message').keypress(function(event) {
    if (event.which == 13) {
      sendMessage();
    }
  });

  NAME = $('#username').text();
  Members = new Array();
  Members_list = new Array();
  RADIUS = 30;
  $('#radius_display_block').text("Radius: " + RADIUS.toFixed(0) + "m");
  if (navigator.geolocation) {
    setupChannel(); // others follow setupChannel()
    setupChat();
    //setupMap(); //monitorPosition after successfully setup map!
  } else {
  	alert('Please turn on location service');
  }
});

// set up channel
function setupChannel() {
  Pusher.channel_auth_endpoint = '/login/auth';
  pusher = new Pusher('0b7f4e07db19c4ba312d');
  var channel = pusher.subscribe('presence-map-channel');

  channel.bind('pusher:subscription_succeeded', function(members) {
    setupMap();
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

    for (var i = 0; i < Members_list.length; i++) {
      if (Members_list[i].name == member.info.user_name) {
        if (Members_list[i].isNear) {
          //console.log('here');
          $('li#member_' + Members_list[i].name).remove();
          $('#members_list').listview('refresh');
        }
        Members_list.splice(i, 1);
      }
    }
  });

  // event for updating postions
  channel.bind('updateMap', function(data) {
    var who = data.name, id = data.id, lat = data.latitude, lon = data.longitude;
    var latlng = new google.maps.LatLng(lat, lon);

    // update the i-th member's info
    var i;
    for (i = 0; i < Members.length; i++) {
      if (Members[i].id == id) {
        Members[i].marker.set('position', latlng);
        
        // others, should check distance
        if (who != NAME) {
          var near;
          if (RADIUS >= myDistance(My_marker.getPosition(), Members[i].marker.getPosition())) {
            // set pumpkin
            // Members[i].marker.set('icon', new google.maps.MarkerImage("/assets/happy.png"));
            near = true;
          } else {
            // set normal
            // Members[i].marker.set('icon', new google.maps.MarkerImage("/assets/smile.png"));
            near = false;
          }
          var j, appended = false;
          // found member
          var date = new Date();
          for (j = 0; j < Members_list.length; j++) {
            if (Members_list[j].name == who) {
              if (Members_list[j].isNear != near) {
                // do list update
                if (near) {
                  appended = true;
                } else {
                  $('li#member_' + who).remove();
                }
                // important!!
                $('#members_list').listview('refresh');
                Members_list[j].isNear = near;
              }
              break;
            }
          }
          // add a new member
          if (j == Members_list.length) {
            var mem = {name: who, isNear: near};
            Members_list.push(mem);
            if (near) {
              appended = true;
            }
          }
          // send notification
          if (appended) {
            var n = noty({
              text: who + ' has just checked in!',
              type: 'success',
              dismissQueue: true,
              layout: 'top',
              theme: 'defaultTheme',
              timeout: 2000
            });
            var hour = date.getHours(), min = date.getMinutes();
            if (hour < 10)
              hour = '0' + hour;
            if (min < 10)
              min = '0' + min; 
            $('#members_list').append('<li id="member_' + who +'">' + who + '<span>' + hour + ':' + min +  '</span></li>');
            $('#members_list').listview('refresh');
          }

          // dirty: to delay pumpkin after notification
          if (near) {
            Members[i].marker.set('icon', new google.maps.MarkerImage("/assets/happy.png"));
          } else {
            Members[i].marker.set('icon', new google.maps.MarkerImage("/assets/smile.png"));
          }
        }
        break;
      }
    }

    // if member not found, add a member
    if (i == Members.length) {

      var marker = new google.maps.Marker({
        position: latlng, 
        map: MAPCANVAS,
        icon: new google.maps.MarkerImage("/assets/happy_128.png", null, null, null, new google.maps.Size(32, 32))
      });

      var mapLabel = new MapLabel({
        text: who,
        position: latlng,
        map: MAPCANVAS,
        fontSize: 12,
        align: 'center'
      });

      marker.bindTo('map', mapLabel);
      marker.bindTo('position', mapLabel);

      var memberinfo;

      // if member is self, add a distanceWidget, change picture
      if (who == NAME) {
        //marker.setIcon(new google.maps.MarkerImage("/assets/witch_hat.png"));
        marker.setIcon(new google.maps.MarkerImage("/assets/witch_hat_128.png", null, null, null, new google.maps.Size(32, 32)));

        My_marker = marker;
        var distanceWidget = new DistanceWidget(MAPCANVAS, marker, mapLabel);
        google.maps.event.addListener(distanceWidget, 'distance_changed', function() {
          RADIUS = distanceWidget.get('distance');
          $('#radius_display_block').text("Radius: " + RADIUS.toFixed(0) + "m");
        });
        memberinfo = {name: who, id: id, marker: marker, latitude: lat, longitude: lon, widget: distanceWidget};
      } else {
        memberinfo = {name: who, id: id, marker: marker, latitude: lat, longitude: lon};
      } 
      Members.push(memberinfo);

      $.mobile.loading('hide');
    }
  });

  // event for shaking!!
  channel.bind('shakeYourPage', function(data) {
    $('#content_container').trigger('startRumble');
    setTimeout(function() {
      $('#content_container').trigger('stopRumble');
    }, 2000);
  });

  // new message
  channel.bind('newMessage', function(data) {
    var from = data.who;
    var msg = data.msg;
    // self is recipient
    if (from == NAME) {
      appendMessage(from, msg);
      return;
    }

    var list = data.list;
    if (list == null || list.indexOf(NAME) == -1)
      return;

    // is recipient
    for (var i = 0; i < Members.length; i++) {
      if(from != Members[i].name)
        continue;
      dist = myDistance(My_marker.getPosition(), Members[i].marker.getPosition());
      dist = dist.toFixed(0);
      appendMessage(from+" ("+dist+"m away)", msg);
      break;
    }
  });
}


// set up chat room
function setupChat() {
  //console.log("here");
  //$('#messages_container').width($(window).width()*0.8);
  var useragent = navigator.userAgent;
  if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
    $('#messages_container').height('180px');
  } else {
    $('#messages_container').height('500px');
  }
  //$('#messages_container').css('text-shadow', '0px');
}

// set up map canvas
function setupMap() {
  
  navigator.geolocation.getCurrentPosition(function(position) {

    $('#map_container').width('100%');

    var useragent = navigator.userAgent;
    if (useragent.indexOf('iPhone') != -1 || useragent.indexOf('Android') != -1 ) {
      $('#map_container').height('300px');
    } else {
      $('#map_container').height('600px');
    }

    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
    var options = {
      zoom: 18,
      center: latlng,
      mapTypeControl: false,
      navigationControlOptions: {style: google.maps.NavigationControlStyle.SMALL},
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      // zoomControl: false,
      streetViewControl: false
    };
    MAPCANVAS = new google.maps.Map(document.getElementById("map_container"), options);
    google.maps.event.trigger(MAPCANVAS, 'resize');

    monitorPosition();
  }, error);
}


// monitor function
function monitorPosition() {
  navigator.geolocation.getCurrentPosition(function(position) {
    var lat = position.coords.latitude, lon = position.coords.longitude;
    sendPosition(lat, lon);
  }, function() {
    alert('error');
  }, {maximumAge:300000});
  //console.log('here');
}

// send current position to server
function sendPosition(lat, lon) {
  $.ajax({
    type: "POST",
    url : "/pos",
    cache: false,
    data: {latitude: lat, longitude: lon},
    success: function() {  setTimeout(monitorPosition, 3000); },
    error: function(xhr){  setTimeout(monitorPosition, 3000); /*alert("note: sendPosition error");*/ }        
 });
}

function showListContainer() {
  if ($('#list_container').is(':hidden')) {
    $('#radar_container').hide(0);
    $('#chat_container').hide(0);
    $('#list_container').slideToggle(600);
  }
}

function showRadarContainer() {
  if ($('#radar_container').is(':hidden')) {
    $('#list_container').hide(0);
    $('#chat_container').hide(0);
    $('#radar_container').slideToggle(600);
    google.maps.event.trigger(MAPCANVAS, 'resize');
  }
}

function showChatContainer() {
  if ($('#chat_container').is(':hidden')) {
    $('#list_container').hide(0);
    $('#radar_container').hide(0);
    $('#chat_container').slideToggle(600);
  }
}

function sendMessage() {
  var msg = $('#input_message').val();
  $('#input_message').val('');
  var namelist = new Array();
  for (var i = 0; i < Members_list.length; i++) {
    if (Members_list[i].isNear) {
      namelist.push(Members_list[i].name);
    }
  }
  $.ajax({
    type: "POST",
    url : "/msg",
    cache: false,
    data: {list: namelist, msg: msg},
  });
}

function isImage(msg) {
  if (msg.length >= 4) {
    var last = msg.substring(msg.length-4, msg.length);
    if (last == ".jpg" || last == ".png") {
      return true;
    }
  }
  return false;
}

function appendMessage(who, msg) {
  var content;
  if (isImage(msg)) {
    content = '<p><span>'+who+'</span><a href="'+msg+'" class="lightbox"><img src="'+msg+'" height="50" width="50"></a>'+'</p>';
  } else {
    content = '<p><span>'+who+'</span>'+msg+'</p>';
  }
  $('#messages_container').append(content);
  $('a.lightbox').lightBox({
    imageLoading: '/assets/lightbox-ico-loading.gif',
    imageBtnClose: '/assets/lightbox-btn-close.gif',
    imageBtnPrev: '/assets/lightbox-btn-prev.gif',
    imageBtnNext: '/assets/lightbox-btn-next.gif',
  });
  $('#messages_container').scrollTop($(this).height());
}

function shakeIt () {
  // send shaking event
  $.ajax({
    type: "POST",
    url : "/shake",
    cache: false//,
    //success: function() {  },
    //error: function(xhr){  setTimeout(monitorPosition, 3000); alert("note: sendPosition error"); }        
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


function DistanceWidget(map, marker, label) {
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

  // !!
  this.bindTo('map', label);
  this.bindTo('position', label);
}
DistanceWidget.prototype = new google.maps.MVCObject();

function RadiusWidget() {
  var circle = new google.maps.Circle({
    strokeColor: "yellow",
    fillColor: "blue",
    strokeWeight: 0,
    fillOpacity: 0.2
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
    title: 'Drag me!',
    icon: new google.maps.MarkerImage("/assets/witch_stick_128.png", null, null, null, new google.maps.Size(32, 32))
  });

  sizer.bindTo('map', this);
  sizer.bindTo('position', this, 'sizer_position');


  var me = this;
  google.maps.event.addListener(sizer, 'drag', function() {
    // Set the circle distance (radius)
    me.setDistance();
  });

  //!!
  //var labelWidget = new LabelWidget(sizer);

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