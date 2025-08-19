class RemoveDuplicateRatings < ActiveRecord::Migration[7.1]
  def up
    # Keep the most recent rating for each user-item combination and remove older duplicates
    execute <<-SQL
      DELETE FROM ratings 
      WHERE id NOT IN (
        SELECT DISTINCT ON (user_id, item_id) id
        FROM ratings 
        ORDER BY user_id, item_id, created_at DESC
      );
    SQL
  end

  def down
    # Can't reverse this operation
  end
end
