'use strict';

export const PHONE_NUMBER_INPUT_CHANGE = 'PHONE_NUMBER_INPUT_CHANGE';
export const PHONE_NUMBER_VALIDATION_ERROR = 'PHONE_NUMBER_VALIDATION_ERROR';
export const CONFIRMED_PHONE_NUMBER = 'CONFIRMED_PHONE_NUMBER';

/**
 * Does phone number validation. Returns error string if phone number is valid,
 * empty string otherwise.
 *
 * Expects an all-numeric string, 10 numbers (area code + 7 digit number)
 *
 * @param { String } phoneNumber - Phone number string to validate
 * @returns { String }
 */
export function validatePhoneNumber(phoneNumber) {
  if (phoneNumber.length !== 10) return 'Phone number should be 10 numbers in length';
  else if (!isNaN(phoneNumber)) return 'Only numbers in the phone number please';
  return '';
}

export function phoneNumberInputChange(phoneNumber = '') {
  return {
    type: PHONE_NUMBER_INPUT_CHANGE,
    value: phoneNumber,
  };
}

export function phoneNumberError(error) {
  return {
    type: PHONE_NUMBER_VALIDATION_ERROR,
    value: error,
  };
}

export function confirmedPhoneNumber() {
  return {
    type: CONFIRMED_PHONE_NUMBER,
  };
}

export const DEFAULT_STATE = {
  phoneNumber: '',
  phoneNumberValidationError: '',
  phoneNumberConfirmed: false,
};
