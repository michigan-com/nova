'use strict';

import { DEFAULT_STATE, PHONE_NUMBER_INPUT_CHANGE, PHONE_NUMBER_VALIDATION_ERROR,
  CONFIRMED_PHONE_NUMBER, UNCONFIRM_PHONE_NUMBER } from '../../actions/phone-number';

export default function reducer(state = DEFAULT_STATE, action) {
  let phoneNumber;
  let phoneNumberValidationError;
  let phoneNumberConfirmed;
  switch (action.type) {
    case PHONE_NUMBER_INPUT_CHANGE:
      phoneNumber = action.value;
      return { ...state, phoneNumber };
    case PHONE_NUMBER_VALIDATION_ERROR:
      phoneNumberValidationError = action.value;
      return { ...state, phoneNumberValidationError };
    case CONFIRMED_PHONE_NUMBER:
      phoneNumberConfirmed = true;
      return { ...state, phoneNumberConfirmed };
    case UNCONFIRM_PHONE_NUMBER:
      phoneNumberConfirmed = false;
      return { ...state, phoneNumberConfirmed };
    default:
      return { ...state };
  }
}
