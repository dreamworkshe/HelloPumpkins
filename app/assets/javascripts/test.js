// function error(msg) {
// 	alert("error!");
// }

// function success(position) {
// 	alert("success!");
// }

// $(function() {
// 	if (navigator.geolocation) {
// 		navigator.geolocation.getCurrentPosition(success, error);
// 	} else {
// 		error('not supported');
// 	}
// });

$("test-link").click(function() {
	alert('...');
});

$(function() {
	var pusher = new Pusher('0b7f4e07db19c4ba312d');
	var channel = pusher.subscribe('test_channel');
	channel.bind('push', function(data) {
		alert(data);
	});
});