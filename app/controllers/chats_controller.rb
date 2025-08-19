class ChatsController < ApplicationController
  before_action :authenticate_user!

  def index
    if current_user.admin?
      @chats = Chat.left_joins(:messages)
                   .group('chats.id')
                   .order(Arel.sql('COALESCE(MAX(messages.created_at), chats.created_at) DESC'))
    else
      @chats = current_user.chats.left_joins(:messages)
                          .group('chats.id')
                          .order(Arel.sql('COALESCE(MAX(messages.created_at), chats.created_at) DESC'))
    end
  end

  def show
    @chat = Chat.find(params[:id])
    
    # Ensure users can only see their own chats (admins can see all)
    unless current_user.admin? || @chat.user == current_user
      redirect_to chats_path, alert: 'You can only view your own chats.'
      return
    end
    
    @messages = @chat.messages.order(timestamp: :asc)
  end

  def new
    @chat = Chat.new
  end

  def create
    @chat = current_user.chats.build(chat_params)
    
    respond_to do |format|
      if @chat.save
        format.html { redirect_to @chat, notice: 'Chat was successfully created.' }
        format.json { render json: { status: 'success', chat_id: @chat.id } }
      else
        format.html { 
          redirect_to chats_path, alert: @chat.errors.full_messages.join(', ')
        }
        format.json { render json: { status: 'error', errors: @chat.errors.full_messages } }
      end
    end
  end

  def destroy
    @chat = Chat.find(params[:id])
    if current_user.admin?
      @chat.destroy
      redirect_to chats_path, notice: 'Chat was successfully ended.'
    else
      redirect_to @chat, alert: 'You do not have permission to end this chat.'
    end
  end


  private

  def chat_params
    params.require(:chat).permit(:title)
  end
end
