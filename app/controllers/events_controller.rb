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
end
