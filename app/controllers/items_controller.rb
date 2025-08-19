class ItemsController < ApplicationController
  include CurrentOrder

  before_action :authenticate_user!

  def index
    @items = Item.all.order(created_at: :desc)
    @items = @items.select { |item| item.itemable.available? } if current_user&.role == "customer"

    if request.headers["Accept"] == "text/html"
      render partial: "items", locals: { items: @items }, layout: false
    end
  end

  def search
    begin
      Rails.logger.info "Search request - User authenticated: #{user_signed_in?}, Request headers: #{request.headers.to_h}"
      
      @items = Item.search(params[:query]).order(created_at: :desc)
      @items = @items.select { |item| item.itemable.available? } if current_user&.role == "customer"
      
      respond_to do |format|
        format.html { render partial: "items", locals: { items: @items }, layout: false }
        format.json { render json: @items }
      end
    rescue => e
      Rails.logger.error "Search error: #{e.message}"
      Rails.logger.error e.backtrace.join("\n")
      
      respond_to do |format|
        format.html { render partial: "items", locals: { items: [] }, layout: false }
        format.json { render json: { error: e.message }, status: 500 }
      end
    end
  end

  def show
    @item = Item.find(params[:id])
  end

  private

  def search_params_present?
    params[:query].present? || params[:strain_type].present? || params[:grow_type].present?
  end
end
