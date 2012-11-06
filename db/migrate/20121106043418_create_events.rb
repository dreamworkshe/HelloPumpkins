class CreateEvents < ActiveRecord::Migration
  def change
    create_table :events do |t|
      t.string :name
      t.integer :capacity
      t.integer :number_registered
      t.integer :number_checkedin
      t.integer :status

      t.timestamps
    end
  end
end
