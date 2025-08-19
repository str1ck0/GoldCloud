class Message < ApplicationRecord
  belongs_to :chat
  belongs_to :user

  validates :chat, presence: true
  validates :user, presence: true
  validates :content, presence: true
  validates :timestamp, presence: true

  before_validation :set_timestamp, on: :create

  private

  def set_timestamp
    self.timestamp ||= Time.current
  end
end
