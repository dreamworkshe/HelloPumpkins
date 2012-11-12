class AddRememberTokenToEvents < ActiveRecord::Migration
  def change
  	add_column :events, :remember_token, :string
  	add_index :events, :remember_token
  end
end
