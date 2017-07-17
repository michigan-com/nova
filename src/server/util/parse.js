'use strict';

/**
 * Parses a phone number string to verify that it is, in fact, a phone number
 * Confirms: all values in the string are numbers, and the string is of length 10
 * Expects to have just area code + 7 numbers e.g. '3135550123'
 *
 * @param {String} phoneNumber - input phone number
 * @returns {Boolean} True if the input string is a valid phone number, false otherwise
 */
export function isValidPhoneNumber(phoneNumber) {
  return !(isNaN(phoneNumber) || `${phoneNumber}`.length != 10);
}
