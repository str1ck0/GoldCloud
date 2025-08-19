import { Controller } from "@hotwired/stimulus";

export default class extends Controller {
  connect() {
    // Ensure Bootstrap dropdowns are properly initialized
    const dropdownTriggerList = this.element.querySelectorAll('[data-bs-toggle="dropdown"]');
    const dropdownList = [...dropdownTriggerList].map(dropdownTriggerEl => {
      return new bootstrap.Dropdown(dropdownTriggerEl);
    });
  }
}