'use strict';

import crypto from 'crypto';

/**
 * Given a password string, sha256 hash it
 *
 * @param {String} password - Password to hash
 */
export function hash(pwd) {
  let sha = crypto.createHash('sha256');
  sha.update(pwd);
  return sha.digest('hex');
}

/**
 * Check a user's password.
 *
 * @param {String} input - Input password
 * @param {String} password - Stored hash of the password to test
 * @return {Boolean} true if the password matches, false otherwise
 */
export function passwordMatch(input, password) {
  return hash(input) === password;
}
