require 'spec_helper'

describe "AuthenticationPages" do

	subject { page }

	describe "signin page" do
		before { visit signin_path }

		# save_and_open_page; 
		it { should have_selector('h1', text: 'Sign in') }
	end

	describe "signin" do
		before { visit signin_path }

		describe "with invalid information" do
			before { click_button "Sign in" }

			it { should have_selector('h1', text: 'Sign in') }

			it { should have_selector('div.alert.alert-error', text: 'Invalid') }

			describe "after visiting another page" do
				before { click_link "Home" }
				it { should_not have_selector('div.alert.alert-error') }
			end

		end

		describe "with valid informaiton" do
			let(:event) { FactoryGirl.create(:event) }
			before do
				fill_in "Name", with: event.name
				click_button "Sign in"
			end

			it { should have_selector('h1', text: event.name) }
			it { should have_link('Profile', href: event_path(event)) }
			it { should have_link('Sign out', href: signout_path) }
			it { should_not have_link('Sign in', href: signin_path) }
		end


	end

end
