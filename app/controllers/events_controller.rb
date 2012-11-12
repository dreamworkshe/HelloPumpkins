class EventsController < ApplicationController
  def new
  	@event = Event.new
  end

  def show
  	#raise params.inspect
  	@event = Event.find(params[:id])
  end

  def create
  	@event = Event.new(params[:event])
  	if @event.save
  		flash[:success] = "Your event has created!"
  		redirect_to @event
  	else
  		render 'new'
  	end
  end

  def push
    Pusher.app_id = '31527'
    Pusher.key = '0b7f4e07db19c4ba312d'
    Pusher.secret = 'f52bf70fb5339bf46300'
    Pusher['test_channel'].trigger!('push', {:id => 12})

  end
end
