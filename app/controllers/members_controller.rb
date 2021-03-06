require 'digest/md5'

class MembersController < ApplicationController
	protect_from_forgery :except => :auth

	def new
		if session[:name] != nil
		 	redirect_to action: 'enter'
		end
	end

	def exit
		reset_session
		redirect_to action: 'new'
	end

	def enter
		if session[:name] == nil
			name = params[:member][:name]
			session[:name] = name
			session[:id] = Digest::MD5.hexdigest(Date.current.to_time.to_i.to_s + "_" + name)
		end
	end

	def auth
		response = Pusher[params[:channel_name]].authenticate(params[:socket_id], {
        user_id: session[:id] , user_info: {user_name: session[:name]} } )
		render :json => response
  end

  def pos
  	who = session[:name]
  	lat = params[:latitude].to_f
  	lon = params[:longitude].to_f

  	puts "Get position from " + who + ": (" + lat.to_s + ", " + lon.to_s + ")"
  	
  	if who == "yaotest"
      lat += 0.002 * rand() - 0.001
      lon += 0.002 * rand() - 0.001
    end
  	Pusher['presence-map-channel'].trigger!('updateMap', {id: session[:id], name: who, latitude: lat, longitude: lon});
  end

  def shake
  	Pusher['presence-map-channel'].trigger!('shakeYourPage', {})
  end

  def msg
  	who = session[:name]
  	list = params[:list]
  	msg = params[:msg]
  	Pusher['presence-map-channel'].trigger!('newMessage', {who: who, list: list, msg: msg})
  end
end
