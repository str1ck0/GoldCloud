class AddStrainAndGrowTypeToProducts < ActiveRecord::Migration[7.1]
  def change
    add_column :products, :strain_type, :string
    add_column :products, :grow_type, :string
    add_index :products, :strain_type
    add_index :products, :grow_type
  end
end
