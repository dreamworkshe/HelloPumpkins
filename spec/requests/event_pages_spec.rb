require 'spec_helper'

describe "Event pages" do
	subject { page }

	describe "register page" do
		before { visit register_path }

		it { should have_selector('h1', text: 'Register') }
		#it { should have_selector('title')}
	end
end
