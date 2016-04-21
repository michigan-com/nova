'use strict';

import debug from 'debug';

import twilio from './twilio';
import now from './now';

var logger = debug('app:routes');

// Set process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN
export default function registerRoutes(app) {
  // Register all the routes
  now(app);
  twilio(app);
}
