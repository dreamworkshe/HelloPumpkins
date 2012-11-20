$(function() {
	Pusher.channel_auth_endpoint = '/login/auth';
	var pusher = new Pusher('0b7f4e07db19c4ba312d');
	var channel = pusher.subscribe('presence-map-channel');

	channel.bind('push', function(data) {
		alert(data);
	});
	channel.bind('pusher:subscription_succeeded', function(members) {
		var whosonline_html = '';
		members.each(function(member) {
			//console.log(member);	
			whosonline_html += '<li class="chat_widget_member" id="chat_widget_member_' +
			member.id + '">' + member.info.user_name + '</li>';
			
		});
		$('#chat_widget_online_list').html(whosonline_html);


		// setInterval(function(){
		// 	channel.trigger("haha", {}, 5000);
		// });

	});
	channel.bind('pusher:member_added', function(member) {
		$('#chat_widget_online_list').append('<li class="chat_widget_member" ' +
      'id="chat_widget_member_' + member.id + '">' + member.info.user_name + '</li>');
	});

	channel.bind('pusher:member_removed', function(member) {
      //this removes the client from the online list and updates the online count
      $('#chat_widget_member_' + member.id).remove();
   });

	channel.bind('haha', function(data) {
		console.log("received.")
	});
});