module SessionsHelper

	def sign_in(event)
		cookies[:remember_token] = {value: event.remember_token,
																expires: 20.years.from_now}
		self.current_event = event
	end

	def signed_in?
		current_event.nil?
	end

	def current_event=(event)
		@current_event = event
	end

	def current_event
		@current_event = @current_event || Event.find_by_remember_token(cookies[:remember_token])
	end


end
