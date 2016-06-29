
'use strict';

import { DEFAULT_STATE, USER_SIGNED_UP, USER_WANTS_BREAKING_NEWS, CODE_INPUT_CHANGE,
  CODE_GENERATED, CODE_CONFIRMED, CODE_VALIDATION_ERROR, PHONE_NUMBER_INPUT_CHANGE,
  PHONE_NUMBER_VALIDATION_ERROR, CONFIRMED_PHONE_NUMBER, UNCONFIRM_PHONE_NUMBER,
  USER_DOES_NOT_WANT_BREAKING_NEWS, BREAKING_NEWS_SIGNUP, REGULAR_SIGNUP,
  } from '../actions/signup';

export default function reducer(state = DEFAULT_STATE, action) {
  let { userWantsBreakingNews, code, codeGenerated, codeConfirmed, codeValidationErrorMessage,
    phoneNumber, phoneNumberValidationError, phoneNumberConfirmed, breakingNewsSignup } = state;
  switch (action.type) {
    case USER_SIGNED_UP:
      return { ...DEFAULT_STATE };
    case USER_WANTS_BREAKING_NEWS:
      userWantsBreakingNews = true;
      return { ...state, userWantsBreakingNews };
    case USER_DOES_NOT_WANT_BREAKING_NEWS:
      userWantsBreakingNews = false;
      return { ...state, userWantsBreakingNews };
    case CODE_INPUT_CHANGE:
      code = action.value;
      codeValidationErrorMessage = '';
      return { ...state, code, codeValidationErrorMessage };
    case CODE_GENERATED:
      codeGenerated = true;
      return { ...state, codeGenerated };
    case CODE_CONFIRMED:
      codeConfirmed = true;
      return { ...state, codeConfirmed };
    case CODE_VALIDATION_ERROR:
      codeValidationErrorMessage = action.value;
      return { ...state, codeValidationErrorMessage };
    case PHONE_NUMBER_INPUT_CHANGE:
      phoneNumber = action.value;
      phoneNumberValidationError = '';
      return { ...state, phoneNumber, phoneNumberValidationError };
    case PHONE_NUMBER_VALIDATION_ERROR:
      phoneNumberValidationError = action.value;
      return { ...state, phoneNumberValidationError };
    case CONFIRMED_PHONE_NUMBER:
      phoneNumberConfirmed = true;
      return { ...state, phoneNumberConfirmed };
    case UNCONFIRM_PHONE_NUMBER:
      phoneNumberConfirmed = false;
      return { ...state, phoneNumberConfirmed };
    case BREAKING_NEWS_SIGNUP:
      breakingNewsSignup = true;
      userWantsBreakingNews = true;
      return { ...state, breakingNewsSignup, userWantsBreakingNews };
    case REGULAR_SIGNUP:
      breakingNewsSignup = false;
      userWantsBreakingNews = false;
      return { ...state, breakingNewsSignup, userWantsBreakingNews };
    default:
      return { ...state };
  }
}
