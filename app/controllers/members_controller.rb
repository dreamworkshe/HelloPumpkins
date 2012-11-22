require 'digest/md5'

class MembersController < ApplicationController
	protect_from_forgery :except => :auth

	def new
		if session[:name] != nil
		 	render 'enter'
		end
	end

	def create
		if session[:name] == nil
			name = params[:member][:name]
			session[:name] = name
			session[:id] = Digest::MD5.hexdigest(Date.current.to_time.to_i.to_s + "_" + name)
		end
		render 'enter'
	end

	def chat
		#Pusher.app_id = '31527'
  	#Pusher.key = '0b7f4e07db19c4ba312d'
  	#Pusher.secret = 'f52bf70fb5339bf46300'
    #Pusher['Map_Channel'].trigger!('push', {:id => 12})
	end

	def enter
		print "receive post!\n"
	end

	def auth
		Pusher.app_id = '31527'
  	Pusher.key = '0b7f4e07db19c4ba312d'
  	Pusher.secret = 'f52bf70fb5339bf46300'
		response = Pusher[params[:channel_name]].authenticate(params[:socket_id], {
        user_id: session[:id] , user_info: {user_name: session[:name]} } )
		#Pusher[params[:channel_name]].trigger!('haha', {});
		render :json => response
  end
end
