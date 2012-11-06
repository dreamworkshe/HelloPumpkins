require 'spec_helper'

describe "Event pages" do
	subject { page }

	describe "event page" do
		let(:event) { FactoryGirl.create(:event) }

		before { visit event_path(event) }

		it { should have_selector('h1', text: event.name) }
	end

	describe "hold event" do

		before { visit hold_path }

		let(:submit) { "Create my event" }

		describe "with invalid information" do

			it "should not create a event do" do
				expect { click_button submit }.not_to change(Event, :count)
			end
		end

		describe "with valid information" do

			before do
				fill_in "Name", with: "Example Event"
				fill_in "Capacity", with: 25
			end


			it "should create a event" do
				expect { click_button submit }.to change(Event, :count).by(1)
			end

			describe "after saving a event" do
				before { click_button submit }

				let(:event) { Event.find_by_name("Example Event") }
				it { should have_selector('h1', text: event.name) }
			end

		end

	end

end
