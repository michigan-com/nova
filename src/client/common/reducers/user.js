'use strict';

import { USER_STATE, LOGOUT } from '../actions/user';

export default function UserReducer(state = USER_STATE, action) {
  let userId = state.userId;
  switch (action.type) {
    case LOGOUT:
      userId = null;
      return { ...state, userId };
    default:
      return { ...state };
  }
}
