'use strict';

import { DEFAULT_PHONE_NUMBER_STATE, SHOW_INPUT, DISMISS_INPUT } from '../../actions/phone-number';

export default function(state=DEFAULT_PHONE_NUMBER_STATE, action) {
  switch(action.type) {
    case SHOW_INPUT:
      return { ...state, showInput: true };
    case DISMISS_INPUT:
      return { ...state, dismissInput: true };
  }
  return { ...state };
}