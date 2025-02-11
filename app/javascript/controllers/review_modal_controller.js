import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  connect() {
    this.element.addEventListener('turbo:submit-end', this.handleSubmission)
  }

  handleSubmission(event) {
    if (event.detail.success) {
      // Close modal on successful submission
      const modal = bootstrap.Modal.getInstance(this.element)
      modal.hide()
      // Optionally reload the page to show the new review
      window.location.reload()
    }
  }
}