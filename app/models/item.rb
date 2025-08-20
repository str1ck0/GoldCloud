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
    like_operator = ActiveRecord::Base.connection.adapter_name.downcase == 'postgresql' ? 'ILIKE' : 'LIKE'
    search_term = "%#{query}%"
  
    # Search in products directly
    product_conditions = if like_operator == 'LIKE'
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

    # Search in packages directly
    package_conditions = if like_operator == 'LIKE'
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

    # Search for packages that contain products with matching strain/grow types
    package_product_conditions = if like_operator == 'LIKE'
      [
        "LOWER(package_products_search.strain_type) LIKE LOWER(?)",
        "LOWER(package_products_search.grow_type) LIKE LOWER(?)"
      ].join(' OR ')
    else
      [
        "package_products_search.strain_type ILIKE ?",
        "package_products_search.grow_type ILIKE ?"
      ].join(' OR ')
    end

    # Combine all conditions
    all_conditions = [
      "(items.itemable_type = 'Product' AND (#{product_conditions}))",
      "(items.itemable_type = 'Package' AND (#{package_conditions}))",
      "(items.itemable_type = 'Package' AND items.itemable_id IN (SELECT DISTINCT packages.id FROM packages INNER JOIN package_products ON packages.id = package_products.package_id INNER JOIN products AS package_products_search ON package_products.product_id = package_products_search.id WHERE #{package_product_conditions}))"
    ].join(' OR ')
  
    # Use explicit joins for better database compatibility
    joins("LEFT JOIN products ON items.itemable_type = 'Product' AND items.itemable_id = products.id")
      .joins("LEFT JOIN packages ON items.itemable_type = 'Package' AND items.itemable_id = packages.id")
      .where(all_conditions, 
        search_term, search_term, search_term, search_term,  # for products
        search_term, search_term,                            # for packages
        search_term, search_term                             # for package products
      )
  end
end
