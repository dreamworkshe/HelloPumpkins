require 'spec_helper'

describe "StaticPages" do

	describe "Home page" do

		it "should have the content 'Check in!'" do
			visit root_path
			page.should have_content('checkin')
			#page.should have_selector('title', text: 'check')

		end

	end

	describe "Help page" do

		it "should have the content 'Help'" do
			visit help_path
			page.should have_content('Help')
		end

	end

end
