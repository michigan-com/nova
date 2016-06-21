'use strict';

import csrf from 'csurf';

/**
 * Creates csrf midddleware as needed. If we dont want csrf protection for some
 * reason (e.g. we're in a test environment), noop middleware will be generated
 *
 * @param {Object} app - Express app. Looks for app.get('use csrf') to determine
 *    enabling of csrf
 * @return {Function} Csrf middleware or noop middleware
 */
export function csrfProtection(app) {
  const shouldCsrf = app.get('use csrf');

  if (shouldCsrf) {
    return csrf({ cookie: true });
  } else {
    return function (req, res, next) {
      next();
    };
  }
}
