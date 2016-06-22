'use strict';

import { DEFAULT_STATE, CODE_INPUT_CHANGE, CODE_GENERATED, CODE_CONFIRMED,
 CODE_VALIDATION_ERROR } from '../../actions/code';

export default function reducer(state = DEFAULT_STATE, action) {
  let code;
  let codeGenerated;
  let codeConfirmed;
  let codeValidationErrorMessage;
  switch (action.type) {
    case CODE_INPUT_CHANGE:
      code = action.value;
      return { ...state, code };
    case CODE_GENERATED:
      codeGenerated = true;
      return { ...state, codeGenerated };
    case CODE_CONFIRMED:
      codeConfirmed = true;
      return { ...state, codeConfirmed };
    case CODE_VALIDATION_ERROR:
      codeValidationErrorMessage = action.value;
      return { ...state, codeValidationErrorMessage };
    default:
      return { ...state };
  }
}
