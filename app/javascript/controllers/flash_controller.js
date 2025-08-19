import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static values = { autoDismiss: Number }

  connect() {
    // Auto-dismiss after specified time (default 5 seconds)
    if (this.autoDismissValue > 0) {
      this.timeout = setTimeout(() => {
        this.dismiss()
      }, this.autoDismissValue)
    }
  }

  disconnect() {
    if (this.timeout) {
      clearTimeout(this.timeout)
    }
  }

  dismiss(event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
    
    // Clear timeout if manually dismissed
    if (this.timeout) {
      clearTimeout(this.timeout)
    }

    // Fade out animation
    this.element.style.transition = "opacity 0.3s ease-out"
    this.element.style.opacity = "0"
    
    setTimeout(() => {
      this.element.remove()
    }, 300)
  }

  // Handle tap events specifically for mobile
  handleTap(event) {
    // Ensure this is actually a tap and not a scroll
    if (event.type === 'touchend') {
      event.preventDefault()
      this.dismiss(event)
    }
  }
}