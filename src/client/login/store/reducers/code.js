'use strict';

import { DEFAULT_STATE, CODE_INPUT_CHANGE, CODE_GENERATED, CODE_CONFIRMED }
  from '../../actions/code';

export default function reducer(state = DEFAULT_STATE, action) {
  let code;
  let codeGenerated;
  let codeConfirmed;
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
    default:
      return { ...state };
  }
}
