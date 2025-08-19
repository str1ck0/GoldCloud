class Item < ApplicationRecord
  belongs_to :itemable, polymorphic: true
  has_many :ratings, -> { order(created_at: :desc) }, dependent: :destroy


  # package instance methods
  delegate :add_product, :remove_product, :product_quantity, to: :itemable, allow_nil: true

  scope :products, -> { where(itemable_type: 'Product') }
  scope :packages, -> { where(itemable_type: 'Package') }

  def primary_photo_url
    itemable.primary_photo_url
  end

  def average_rating
    avg = ratings.where(hidden: !true).average(:score)
    avg&.round(1) || 0.0
  end

  def self.search(query)
    return all unless query.present?
    
    # Database-agnostic search method
    # Works with both SQLite (LIKE) and PostgreSQL (ILIKE)
    itemable_types = ['Product', 'Package']
    
    # Determine if we're using PostgreSQL or SQLite
    like_operator = ActiveRecord::Base.connection.adapter_name.downcase == 'postgresql' ? 'ILIKE' : 'LIKE'
    search_term = "%#{query}%"
  
    conditions = itemable_types.map do |type|
      if type == 'Product'
        if like_operator == 'LIKE'
          # SQLite: case insensitive using LOWER
          [
            "LOWER(products.name) LIKE LOWER(?)",
            "LOWER(products.description) LIKE LOWER(?)", 
            "LOWER(products.strain_type) LIKE LOWER(?)",
            "LOWER(products.grow_type) LIKE LOWER(?)"
          ].join(' OR ')
        else
          # PostgreSQL: use ILIKE for case insensitive
          [
            "products.name ILIKE ?",
            "products.description ILIKE ?",
            "products.strain_type ILIKE ?",
            "products.grow_type ILIKE ?"
          ].join(' OR ')
        end
      else
        if like_operator == 'LIKE'
          # SQLite: case insensitive using LOWER
          [
            "LOWER(packages.name) LIKE LOWER(?)",
            "LOWER(packages.description) LIKE LOWER(?)"
          ].join(' OR ')
        else
          # PostgreSQL: use ILIKE for case insensitive
          [
            "packages.name ILIKE ?",
            "packages.description ILIKE ?"
          ].join(' OR ')
        end
      end
    end.join(' OR ')
  
    # Use explicit joins for better database compatibility
    joins("LEFT JOIN products ON items.itemable_type = 'Product' AND items.itemable_id = products.id")
      .joins("LEFT JOIN packages ON items.itemable_type = 'Package' AND items.itemable_id = packages.id")
      .where(conditions, 
        search_term, search_term, search_term, search_term,  # for products
        search_term, search_term                              # for packages
      )
  end
end
