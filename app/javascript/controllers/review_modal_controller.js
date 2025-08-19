import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["star", "scoreInput", "ratingError"]

  connect() {
    this.element.addEventListener('turbo:submit-end', this.handleSubmission)
  }

  setRating(event) {
    // Get the clicked star's value
    const rating = parseInt(event.currentTarget.dataset.value)
    // Update the hidden input field
    this.scoreInputTarget.value = rating
    // Reset all stars
    this.starTargets.forEach((star, index) => {
      if (index < rating) {
        star.classList.remove('bi-star')
        star.classList.add('bi-star-fill')
      } else {
        star.classList.remove('bi-star-fill')
        star.classList.add('bi-star')
      }
    })
    // Hide error message
    this.ratingErrorTarget.style.display = 'none'
  }

  validateRating(event) {
    // check if rating was selected
    if (!this.scoreInputTarget.value) {
      event.preventDefault()
      this.ratingErrorTarget.style.display = 'block'
    }

  }

  handleSubmission(event) {
    if (event.detail.success) {
      // Reload the page after successful submission
      window.location.reload()
    }
  }
}