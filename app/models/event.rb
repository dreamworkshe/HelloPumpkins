class Event < ActiveRecord::Base
  attr_accessible :capacity, :name, :number_checkedin, :number_registered, :status

  before_save :create_remember_token

  validates :name, presence: true, length: { maximum: 100 }, uniqueness: { case_sensitive: false }
  validates :capacity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1 }

private
	
	def create_remember_token
		self.remember_token = SecureRandom.urlsafe_base64
	end

end
