'use strict';

export function loginRequired(req, res, next) {
  if (!req.user) {
    return res.status(401).send('Forbidden');
  }
  return next();
}
