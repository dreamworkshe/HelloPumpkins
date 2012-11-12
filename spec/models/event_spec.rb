require 'spec_helper'

describe Event do
  # test the Event model!
  before { @event = Event.new(name:"Test Event", capacity: 20) }
  subject { @event }

  describe "when name is null" do
  	before do
  		@event.name = ""
  		@event.save
  	end
  	it { should_not be_valid }
  end

  
end
