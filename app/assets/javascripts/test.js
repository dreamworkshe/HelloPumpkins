function error(msg) {
	alert("error!");
}

function success(position) {
  var mapcanvas = document.createElement('div');
  mapcanvas.id = 'mapcanvas';
  mapcanvas.style.height = '400px';
  mapcanvas.style.width = '560px';
    
  $('#time').append(mapcanvas);
  
  var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
  var myOptions = {
    zoom: 15,
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


$("test-link").click(function() {
	alert('...');
});

$(function() {
	var pusher = new Pusher('0b7f4e07db19c4ba312d');
	var channel = pusher.subscribe('test_channel');
	channel.bind('push', function(data) {
		//alert(data);
	});
	var d = new Date();
	//alert($("#time").html());
	$("#time").text(d.getDate());


});

if (navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(success, error);
} else {
	error('not supported');
}