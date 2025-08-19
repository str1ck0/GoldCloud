class AddUniqueIndexToRatings < ActiveRecord::Migration[7.1]
  def change
    add_index :ratings, [:user_id, :item_id], unique: true
  end
end
