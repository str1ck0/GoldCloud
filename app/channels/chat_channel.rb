class ChatChannel < ApplicationCable::Channel
  def subscribed
    chat = Chat.find(params[:chat_id])
    
    # Only allow users to subscribe to their own chats or admins to all chats
    if current_user.admin? || chat.user == current_user
      stream_from "chat_#{chat.id}"
    else
      reject
    end
  end

  def unsubscribed
    # Any cleanup needed when channel is unsubscribed
  end

  def speak(data)
    chat = Chat.find(params[:chat_id])
    message = chat.messages.create!(
      content: data['content'],
      user: current_user,
      timestamp: Time.current
    )
  end
end
