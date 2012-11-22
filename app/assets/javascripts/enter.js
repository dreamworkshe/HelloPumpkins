if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(success, error);
  navigator.geolocation.watchPosition(function(position){
    // These variables update every time the location changes
    var Latitude = position.coords.latitude;
    var Longitude = position.coords.longitude;
    alert(Latitude + " " + Longitude);
  }, function(error){
    // You can detect the reason and alert it; I chose not to.   
    alert('We could not get your location');
  },{
    // It'll stop looking after an hour. Enabling high accuracy tells it to use GPS if it's available  
    timeout: 1500,
    maximumAge: 600000,
    enableHighAccuracy: true
  });
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