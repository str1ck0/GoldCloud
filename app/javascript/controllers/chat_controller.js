import { Controller } from "@hotwired/stimulus";
import consumer from "channels/consumer";

export default class extends Controller {
  static targets = ["messageInput", "submitButton"];
  static values = { chatId: Number };

  connect() {
    console.log("Chat controller connected, chat ID:", this.chatIdValue);
    this.createSubscription();
    this.scrollToBottom();
    this.observeMessages();
  }

  observeMessages() {
    const messagesContainer = document.getElementById("messages");
    if (messagesContainer) {
      // Watch for changes in the messages container
      const observer = new MutationObserver((mutations) => {
        console.log("DOM mutations detected:", mutations.length);
        // Delay to ensure DOM is fully updated
        setTimeout(() => {
          this.scrollToBottom();
        }, 20);
        setTimeout(() => {
          this.scrollToBottom();
        }, 100);
      });
      
      observer.observe(messagesContainer, { 
        childList: true, 
        subtree: true,
        attributes: true,
        characterData: true
      });
      
      this.messageObserver = observer;
    }
  }

  disconnect() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    if (this.messageObserver) {
      this.messageObserver.disconnect();
    }
  }

  createSubscription() {
    this.subscription = consumer.subscriptions.create(
      {
        channel: "ChatChannel",
        chat_id: this.chatIdValue
      },
      {
        connected: () => {
          console.log("Connected to chat channel");
        },
        
        disconnected: () => {
          console.log("Disconnected from chat channel");
        },
        
        received: (data) => {
          console.log("Received message:", data);
          this.appendMessage(data.message);
          this.scrollToBottom();
        }
      }
    );
  }

  appendMessage(messageHtml) {
    const messagesContainer = document.getElementById("messages");
    const emptyState = messagesContainer.querySelector('.text-center');
    
    if (emptyState) {
      emptyState.remove();
    }
    
    messagesContainer.insertAdjacentHTML('beforeend', messageHtml);
    
    // Add a scroll anchor element and scroll to it
    const scrollAnchor = document.createElement('div');
    scrollAnchor.id = 'scroll-anchor';
    scrollAnchor.style.height = '1px';
    messagesContainer.appendChild(scrollAnchor);
    
    // Multiple scroll attempts with different methods
    setTimeout(() => {
      scrollAnchor.scrollIntoView({ behavior: 'smooth' });
      this.scrollToBottom();
    }, 10);
    
    setTimeout(() => {
      scrollAnchor.scrollIntoView({ behavior: 'auto' });
      this.scrollToBottom();
      // Remove anchor after scrolling
      scrollAnchor.remove();
    }, 100);
  }

  handleKeydown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      this.submitForm();
    }
  }

  submitForm() {
    const form = this.element.querySelector("#message-form");
    const content = this.messageInputTarget.value.trim();
    
    if (content) {
      // Submit via Turbo
      form.requestSubmit();
    }
  }

  clearForm() {
    this.messageInputTarget.value = "";
    this.messageInputTarget.style.height = "40px";
    this.messageInputTarget.focus();
  }

  scrollToBottom() {
    const messagesContainer = document.getElementById("messages");
    if (messagesContainer) {
      // Try multiple scroll methods for maximum compatibility
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
      messagesContainer.scrollTo(0, messagesContainer.scrollHeight);
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: 'smooth'
      });
      
      // Force immediate scroll without smooth behavior as backup
      setTimeout(() => {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }, 10);
      
      console.log("Scrolled to bottom, scrollHeight:", messagesContainer.scrollHeight, "scrollTop:", messagesContainer.scrollTop);
    }
  }

  messageSubmitted() {
    console.log("Message submitted successfully");
    // Immediate scroll and delayed scroll for reliability
    this.scrollToBottom();
    setTimeout(() => this.scrollToBottom(), 50);
    setTimeout(() => this.scrollToBottom(), 200);
    setTimeout(() => this.scrollToBottom(), 500);
  }

  clearForm() {
    this.messageInputTarget.value = "";
    this.messageInputTarget.style.height = "40px";
    this.messageInputTarget.focus();
    // Multiple scroll attempts
    setTimeout(() => this.scrollToBottom(), 10);
    setTimeout(() => this.scrollToBottom(), 100);
    setTimeout(() => this.scrollToBottom(), 300);
  }
}