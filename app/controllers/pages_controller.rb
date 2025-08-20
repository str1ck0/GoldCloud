class PagesController < ApplicationController
  include CurrentOrder

  skip_before_action :redirect_logged_in_user, only: [:home]
  before_action :authenticate_user!, except: [:home] # Ensures the user is logged in

  def home
    redirect_to items_path if user_signed_in?
  end

  def account
    @user = current_user
    @new_driver = User.new if @user.admin?
  end

  def update_password
    @user = current_user
    
    if @user.update_with_password(password_params)
      bypass_sign_in(@user)
      redirect_to account_path, notice: 'Password updated successfully.'
    else
      redirect_to account_path, alert: @user.errors.full_messages.join(', ')
    end
  end

  def update_username
    @user = current_user
    
    if @user.update(username: params[:user][:username])
      redirect_to account_path, notice: 'Username updated successfully.'
    else
      redirect_to account_path, alert: @user.errors.full_messages.join(', ')
    end
  end

  def delete_account
    @user = current_user
    
    if @user.valid_password?(params[:user][:current_password])
      @user.destroy
      redirect_to root_path, notice: 'Account deleted successfully.'
    else
      redirect_to account_path, alert: 'Incorrect password. Account not deleted.'
    end
  end

  def create_driver
    redirect_to account_path, alert: 'Access denied.' unless current_user.admin?
    
    @new_driver = User.new(driver_params)
    @new_driver.role = :driver
    
    if @new_driver.save
      redirect_to account_path, notice: "Driver #{@new_driver.username} created successfully."
    else
      @user = current_user
      redirect_to account_path, alert: @new_driver.errors.full_messages.join(', ')
    end
  end

  private

  def password_params
    params.require(:user).permit(:current_password, :password, :password_confirmation)
  end

  def driver_params
    params.require(:new_driver).permit(:username, :email, :password, :password_confirmation)
  end
end
