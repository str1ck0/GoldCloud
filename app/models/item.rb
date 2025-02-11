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
    
    itemable_types = ['Product', 'Package']
  
    conditions = itemable_types.map do |type|
      if type == 'Product'
        [
          "products.name ILIKE :query",
          "products.description ILIKE :query",
          "products.strain_type ILIKE :query",
          "products.grow_type ILIKE :query"
        ].join(' OR ')
      else
        [
          "packages.name ILIKE :query",
          "packages.description ILIKE :query"
        ].join(' OR ')
      end
    end.join(' OR ')
  
    joins_clause = itemable_types.map do |type|
      "LEFT JOIN #{type.tableize} ON items.itemable_type = '#{type}' AND items.itemable_id = #{type.tableize}.id"
    end.join(' ')
  
    joins(joins_clause).where(conditions, query: "%#{query}%")
  end
end
