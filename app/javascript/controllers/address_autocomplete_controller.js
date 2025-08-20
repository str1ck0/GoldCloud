import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static targets = ["input", "dropdown", "iconBtn", "icon"]
  static values = { country: String }

  connect() {
    // Default to South Africa if no country specified
    this.country = this.countryValue || "ZA"
    this.timeout = null
    // Initialize the icon state
    this.updateIcon()
  }

  search() {
    // Clear any existing timeout
    clearTimeout(this.timeout)
    
    const query = this.inputTarget.value.trim()
    
    if (query.length < 3) {
      this.hideDropdown()
      return
    }

    // Debounce the search to avoid too many requests
    this.timeout = setTimeout(() => {
      this.performSearch(query)
    }, 300)
  }

  async performSearch(query) {
    try {
      // Show loading state
      this.element.classList.add('loading')
      
      // Using Nominatim (OpenStreetMap) free geocoding service
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&limit=5&countrycodes=${this.country}&q=${encodeURIComponent(query)}`,
        {
          headers: {
            'User-Agent': 'GoldCloud-App/1.0' // Required by Nominatim
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Geocoding service unavailable')
      }
      
      const results = await response.json()
      this.showSuggestions(results)
      
    } catch (error) {
      console.error('Address search error:', error)
      this.showError()
    } finally {
      // Remove loading state
      this.element.classList.remove('loading')
    }
  }

  showSuggestions(results) {
    if (results.length === 0) {
      this.hideDropdown()
      return
    }

    // Clear existing suggestions
    this.dropdownTarget.innerHTML = ''
    
    results.forEach(result => {
      const suggestion = this.createSuggestionElement(result)
      this.dropdownTarget.appendChild(suggestion)
    })
    
    // Check if we should position above to avoid navbar
    this.adjustPosition()
    
    this.dropdownTarget.classList.remove('d-none')
  }

  adjustPosition() {
    // Check if dropdown would be hidden by bottom navbar
    const inputRect = this.inputTarget.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const navbarHeight = 97 // Your app's navbar height
    const availableSpace = viewportHeight - navbarHeight - inputRect.bottom
    const dropdownHeight = 300 // max-height from CSS
    
    if (availableSpace < dropdownHeight && inputRect.top > dropdownHeight) {
      // Not enough space below, but enough above - show above
      this.dropdownTarget.classList.add('position-above')
    } else {
      // Show below as normal
      this.dropdownTarget.classList.remove('position-above')
    }
  }

  createSuggestionElement(result) {
    const div = document.createElement('div')
    div.className = 'address-suggestion p-3 border-bottom'
    div.style.cursor = 'pointer'
    
    // Format the address nicely
    const address = this.formatAddress(result)
    
    div.innerHTML = `
      <div class="d-flex align-items-center">
        <i class="bi bi-geo-alt me-2"></i>
        <div>
          <div class="fw-medium text-white">${address.main}</div>
          ${address.detail ? `<small>${address.detail}</small>` : ''}
        </div>
      </div>
    `
    
    div.addEventListener('click', () => {
      this.selectAddress(result.display_name)
    })
    
    div.addEventListener('mouseenter', () => {
      div.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'
    })
    
    div.addEventListener('mouseleave', () => {
      div.style.backgroundColor = 'transparent'
    })
    
    return div
  }

  formatAddress(result) {
    const address = result.address || {}
    
    // Build main address line
    const parts = []
    
    if (address.house_number) parts.push(address.house_number)
    if (address.road) parts.push(address.road)
    if (address.suburb) parts.push(address.suburb)
    
    const main = parts.join(' ') || result.display_name.split(',')[0]
    
    // Build detail line
    const details = []
    if (address.city) details.push(address.city)
    if (address.state) details.push(address.state)
    if (address.postcode) details.push(address.postcode)
    
    return {
      main: main,
      detail: details.join(', ')
    }
  }

  selectAddress(address) {
    this.inputTarget.value = address
    this.hideDropdown()
    this.updateIcon()
    
    // Trigger change event so other parts of the form know the value changed
    this.inputTarget.dispatchEvent(new Event('change', { bubbles: true }))
  }

  showError() {
    this.dropdownTarget.innerHTML = `
      <div class="address-suggestion p-3">
        <div class="d-flex align-items-center">
          <i class="bi bi-exclamation-triangle me-2 text-warning"></i>
          <div>
            <div class="text-white-50">Unable to load address suggestions</div>
            <small class="text-muted">Please type your full address manually</small>
          </div>
        </div>
      </div>
    `
    this.dropdownTarget.classList.remove('d-none')
    
    // Hide error after 3 seconds
    setTimeout(() => {
      this.hideDropdown()
    }, 3000)
  }

  hideDropdown() {
    this.dropdownTarget.classList.add('d-none')
  }

  // Hide dropdown when clicking outside
  clickOutside(event) {
    if (!this.element.contains(event.target)) {
      this.hideDropdown()
    }
  }

  // Handle keyboard navigation
  keydown(event) {
    const suggestions = this.dropdownTarget.querySelectorAll('.address-suggestion')
    
    if (suggestions.length === 0) return
    
    let activeIndex = Array.from(suggestions).findIndex(s => 
      s.style.backgroundColor === 'rgba(255, 255, 255, 0.1)'
    )
    
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        activeIndex = activeIndex < suggestions.length - 1 ? activeIndex + 1 : 0
        this.highlightSuggestion(suggestions, activeIndex)
        break
        
      case 'ArrowUp':
        event.preventDefault()
        activeIndex = activeIndex > 0 ? activeIndex - 1 : suggestions.length - 1
        this.highlightSuggestion(suggestions, activeIndex)
        break
        
      case 'Enter':
        event.preventDefault()
        if (activeIndex >= 0) {
          suggestions[activeIndex].click()
        }
        break
        
      case 'Escape':
        this.hideDropdown()
        break
    }
  }

  highlightSuggestion(suggestions, activeIndex) {
    suggestions.forEach((s, i) => {
      s.style.backgroundColor = i === activeIndex ? 'rgba(255, 255, 255, 0.1)' : 'transparent'
    })
  }

  // Clear the input when X is clicked
  clear() {
    this.inputTarget.value = ''
    this.hideDropdown()
    this.updateIcon()
    this.inputTarget.focus()
  }

  // Handle icon click (search or clear)
  handleIconClick() {
    if (this.inputTarget.value.trim() !== '') {
      this.clear()
    }
    // If it's search mode (empty input), do nothing
  }

  // Update icon based on input content
  updateIcon() {
    // Only update if we have icon targets
    if (!this.hasIconTarget || !this.hasIconBtnTarget) return
    
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

  disconnect() {
    clearTimeout(this.timeout)
    document.removeEventListener('click', this.clickOutside.bind(this))
  }
}