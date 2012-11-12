class SessionsController < ApplicationController

	def new
	end

	def create
		event = Event.find_by_name(params[:session][:name])
		if event != nil
			sign_in event
			redirect_to event
		else
			flash.now[:error] = "Invalid event name"
			render 'new'
		end
	end

	def destroy
	end

end
