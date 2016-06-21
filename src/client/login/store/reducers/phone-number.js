'use strict';

import { DEFAULT_STATE, PHONE_NUMBER_INPUT_CHANGE, PHONE_NUMBER_VALIDATION_ERROR,
  CONFIRMED_PHONE_NUMBER } from '../../actions/phone-number';

export function reducer(state = DEFAULT_STATE, action) {
  let phoneNumber;
  let phoneNumberValidationError;
  let confirmedPhoneNumber;
  switch (action.type) {
    case PHONE_NUMBER_INPUT_CHANGE:
      phoneNumber = action.value;
      return { ...state, phoneNumber };
    case PHONE_NUMBER_VALIDATION_ERROR:
      phoneNumberValidationError = action.value;
      return { ...state, phoneNumberValidationError };
    case CONFIRMED_PHONE_NUMBER:
      confirmedPhoneNumber = true;
      return { ...state, confirmedPhoneNumber };
    default:
      return { ...state };
  }
}
