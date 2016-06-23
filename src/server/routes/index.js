'use strict';

import texting from './texting';
import now from './now';
import login from './login';
import breaking from './breaking-news';
import user from './user';

// Set process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN
export default function registerRoutes(app) {
  // Register all the routes
  now(app);
  texting(app);
  login(app);
  breaking(app);
  user(app);
}
