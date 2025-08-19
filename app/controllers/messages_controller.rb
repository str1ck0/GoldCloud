class MessagesController < ApplicationController
  before_action :authenticate_user!
  before_action :set_chat

  def create
    @message = @chat.messages.build(message_params)
    @message.user = current_user
    @message.timestamp = Time.current
    
    respond_to do |format|
      if @message.save
        # Broadcast the message to all connected clients
        ActionCable.server.broadcast(
          "chat_#{@chat.id}", 
          {
            message: render_to_string(
              partial: 'chats/message', 
              locals: { message: @message, current_user: current_user }
            )
          }
        )
        
        format.html { redirect_to @chat }
        format.turbo_stream { head :ok }
        format.json { render json: { status: 'success' } }
      else
        format.html { redirect_to @chat, alert: @message.errors.full_messages.join(', ') }
        format.turbo_stream { 
          render turbo_stream: turbo_stream.replace(
            "message-form", 
            partial: "shared/error_messages", 
            locals: { errors: @message.errors.full_messages }
          )
        }
        format.json { render json: { status: 'error', errors: @message.errors.full_messages } }
      end
    end
  end

  private

  def set_chat
    @chat = Chat.find(params[:chat_id])
  end

  def message_params
    params.require(:message).permit(:content)
  end
end
