class Event < ActiveRecord::Base
  attr_accessible :capacity, :name, :number_checkedin, :number_registered, :status

  validates :name, presence: true, length: { maximum: 100 }, uniqueness: { case_sensitive: false }
  validates :capacity, presence: true, numericality: { only_integer: true, greater_than_or_equal_to: 1 }

end
