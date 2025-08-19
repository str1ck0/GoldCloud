// Action Cable provides the framework to deal with WebSockets in Rails.
// You can generate new channels where WebSocket features live using the `bin/rails generate channel` command.

import { createConsumer } from "@rails/actioncable"

// Get user ID from meta tag if available
const userId = document.querySelector('meta[name="current-user-id"]')?.getAttribute('content');
const consumerUrl = userId ? `/cable?user_id=${userId}` : '/cable';

export default createConsumer(consumerUrl)