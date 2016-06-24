'use strict';

export const USER_SIGNED_UP = 'USER_SIGNED_UP';
export const USER_WANTS_BREAKING_NEWS = 'USER_WANTS_BREAKING_NEWS';
export const USER_DOES_NOT_WANT_BREAKING_NEWS = 'USER_DOES_NOT_WANT_BREAKING_NEWS';

export const CODE_INPUT_CHANGE = 'CODE_INPUT_CHANGE';
export const CODE_GENERATED = 'CODE_GENERATED';
export const CODE_CONFIRMED = 'CODE_CONFIRMED';
export const CODE_VALIDATION_ERROR = 'CODE_VALIDATION_ERROR';

export const PHONE_NUMBER_INPUT_CHANGE = 'PHONE_NUMBER_INPUT_CHANGE';
export const PHONE_NUMBER_VALIDATION_ERROR = 'PHONE_NUMBER_VALIDATION_ERROR';
export const CONFIRMED_PHONE_NUMBER = 'CONFIRMED_PHONE_NUMBER';
export const UNCONFIRM_PHONE_NUMBER = 'UNCONFIRM_PHONE_NUMBER';

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

export function unconfirmPhoneNumber() {
  return {
    type: UNCONFIRM_PHONE_NUMBER,
  };
}

export function codeGenerated() {
  return {
    type: CODE_GENERATED,
  };
}

export function codeInputChange(code = '') {
  return {
    type: CODE_INPUT_CHANGE,
    value: code,
  };
}

export function codeConfirmed() {
  return {
    type: CODE_CONFIRMED,
  };
}

export function codeValidationError(error = '') {
  return {
    type: CODE_VALIDATION_ERROR,
    value: error,
  };
}

export function userSignedUp() {
  return {
    type: USER_SIGNED_UP,
  };
}

export function userWantsBreakingNews() {
  return {
    type: USER_WANTS_BREAKING_NEWS,
  };
}

export function userDoesNotWantBreakingNews() {
  return {
    type: USER_DOES_NOT_WANT_BREAKING_NEWS,
  };
}

export const DEFAULT_STATE = {
  breakingNewsSignup: false, // TODO make an action to set this type of signup
  userWantsBreakingNews: false,
  userSignedUp: false,
  userSignupError: '',

  code: '',
  codeGenerated: false,
  codeConfirmed: false,
  codeValidationErrorMessage: '',

  phoneNumber: '',
  phoneNumberValidationError: '',
  phoneNumberConfirmed: false,
};
