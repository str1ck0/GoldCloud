class RatingsController < ApplicationController
  before_action :authenticate_user!
  before_action :set_rating, only: [:update, :destroy]
  before_action :authorize_admin, only: [:destroy]

  def create
    # Check if user already has a rating for this item
    existing_rating = current_user.ratings.find_by(item_id: rating_params[:item_id])
    
    if existing_rating
      # Update existing rating instead of creating new one
      if existing_rating.update(rating_params.except(:item_id))
        redirect_to item_path(existing_rating.item), notice: 'Review updated!'
      else
        redirect_to item_path(existing_rating.item), alert: existing_rating.errors.full_messages.join(', ')
      end
    else
      # Create new rating
      @rating = current_user.ratings.build(rating_params)
      @rating.hidden = false;
      if @rating.save
        redirect_to item_path(@rating.item), notice: 'Review added!'
      else
        redirect_to item_path(@rating.item), alert: @rating.errors.full_messages.join(', ')
      end
    end
  end

  def update
    if @rating.update(rating_params)
      redirect_to item_path(@rating.item), notice: 'Rating updated!'
    else
      redirect_to item_path(@rating.item), alert: @rating.errors.full_messages.join(', ')
    end
  end

  def destroy
    @rating.update(hidden: true)
    redirect_to item_path(@rating.item), notice: 'Rating hidden'
  end

  private

  def rating_params
    params.require(:rating).permit(:score, :comment, :item_id)
  end

  def set_rating
    @rating = Rating.find(params[:id])
  end

  def authorize_admin
    unless current_user.admin?
      redirect_to root_path, alert: 'Not authorized'
    end
  end
end