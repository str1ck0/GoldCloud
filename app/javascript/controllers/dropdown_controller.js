import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    // Wait for Bootstrap to load, then initialize dropdowns
    this.initializeDropdowns();
  }

  initializeDropdowns() {
    // Check if Bootstrap is available
    if (typeof bootstrap !== 'undefined' && bootstrap.Dropdown) {
      const dropdownTriggerList = this.element.querySelectorAll('[data-bs-toggle="dropdown"]');
      
      dropdownTriggerList.forEach(dropdownTriggerEl => {
        // Ensure dropdown isn't already initialized
        if (!dropdownTriggerEl._dropdown) {
          try {
            dropdownTriggerEl._dropdown = new bootstrap.Dropdown(dropdownTriggerEl);
          } catch (error) {
            console.log('Bootstrap dropdown initialization failed:', error);
          }
        }
      });
    } else {
      // Retry in 100ms if Bootstrap isn't ready yet
      setTimeout(() => this.initializeDropdowns(), 100);
    }
  }

  // Handle manual dropdown toggle for mobile
  toggle(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const button = event.currentTarget;
    const dropdown = button._dropdown || bootstrap.Dropdown.getInstance(button);
    
    if (dropdown) {
      dropdown.toggle();
    } else {
      // Fallback: manually toggle the dropdown menu
      const menu = button.nextElementSibling;
      if (menu && menu.classList.contains('dropdown-menu')) {
        menu.classList.toggle('show');
      }
    }
  }
}