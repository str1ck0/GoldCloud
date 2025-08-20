import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "results", "iconBtn", "icon"]

  connect() {
    // Initialize the icon state
    this.updateIcon()
  }

  search() {
    // Clear any existing timeout to implement debouncing
    clearTimeout(this.timeout)

    // Set a new timeout to wait for user to finish typing
    this.timeout = setTimeout(() => {
      // Get the search query from the input field
      const query = this.inputTarget.value

      // If query is empty, load all items
      const searchUrl = query ? `/items/search?query=${encodeURIComponent(query)}` : '/items'

      // Use the search endpoint
      fetch(searchUrl, {
        method: 'GET',
        headers: { 
          "Accept": "text/html",
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": document.querySelector('[name="csrf-token"]').getAttribute('content')
        },
        credentials: 'include'
      })
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.text();
        })
        .then(html => {
          // Update the results container with the returned HTML
          this.resultsTarget.innerHTML = html;
          // Update icon state after search
          this.updateIcon();
        })
        .catch(error => {
          console.error('Search error:', error);
          // Show error message to user
          this.resultsTarget.innerHTML = '<div class="alert alert-warning">Search error. Please refresh the page and try again.</div>';
          
          // If it's a 401 error, redirect to login
          if (error.message.includes('401')) {
            window.location.href = '/users/sign_in';
          }
        });
    }, 300) // Wait 300ms after last keystroke before sending request
  }

  clear() {
    // Clear the input field
    this.inputTarget.value = ''
    
    // Trigger a search to show all items again
    this.search()
    
    // Focus back on the input
    this.inputTarget.focus()
  }

  handleIconClick() {
    // Only clear if we're in clear mode (input has content)
    if (this.inputTarget.value.trim() !== '') {
      this.clear()
    }
    // If it's search mode (empty input), do nothing
  }

  updateIcon() {
    const hasContent = this.inputTarget.value.trim() !== ''
    
    if (hasContent) {
      // Switch to clear mode
      this.iconTarget.className = 'bi bi-x-lg'
      this.iconBtnTarget.className = 'search-icon-btn clear-mode'
    } else {
      // Switch to search mode
      this.iconTarget.className = 'bi bi-search'
      this.iconBtnTarget.className = 'search-icon-btn search-mode'
    }
  }
}
