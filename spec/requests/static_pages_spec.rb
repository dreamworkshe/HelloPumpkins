require 'spec_helper'

describe "StaticPages" do

	describe "Home page" do

		it "should have the content 'Check in!'" do
			visit '/static_pages/home'
			page.should have_content('check')
			page.should have_selector('title', :text => 'check')

		end

	end

	describe "Help page" do

		it "should have the content 'Help'" do
			visit '/static_pages/help'
			page.should have_content('Help')

		end

	end

end
