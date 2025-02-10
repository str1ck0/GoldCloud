import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "results"]

  search() {
    // Clear any existing timeout to implement debouncing
    clearTimeout(this.timeout)

    // Set a new timeout to wait for user to finish typing
    this.timeout = setTimeout(() => {
      // Get the search query from the input field
      const query = this.inputTarget.value

      // Use the new search endpoint instead of the index endpoint
      fetch(`/items/search?query=${encodeURIComponent(query)}`, {
        headers: { 
          // Request HTML response format
          "Accept": "text/html" 
        }
      })
        .then(response => response.text())
        .then(html => {
          // Update the results container with the returned HTML
          this.resultsTarget.innerHTML = html
        })
    }, 300) // Wait 300ms after last keystroke before sending request
  }
}
