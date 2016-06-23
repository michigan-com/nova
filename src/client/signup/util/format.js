'use strict';

/**
 * Given a ten-digit phone number, format it as (313) 555-0123
 *
 * @param {String} phoneNumber - string of length 10, representing a phone number
 * @returns {String} Formatted phone number: e.g. (313) 555-0123.
 *
 */
export function formatPhoneNumber(phoneNumber = '') {
  const areaCode = phoneNumber.slice(0, 3);
  const firstNumbers = phoneNumber.slice(3, 6);
  const secondNumbers = phoneNumber.slice(6, 10);
  return `(${areaCode}) ${firstNumbers}-${secondNumbers}`;
}
