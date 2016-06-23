'use strict';

import { USER_STATE, LOGOUT, SHOW_PROFILE_PAGE, HIDE_PROFILE_PAGE } from '../actions/user';

export default function UserReducer(state = USER_STATE, action) {
  let userId;
  let showProfilePage;
  switch (action.type) {
    case LOGOUT:
      userId = null;
      return { ...state, userId };
    case SHOW_PROFILE_PAGE:
      showProfilePage = true;
      return { ...state, showProfilePage };
    case HIDE_PROFILE_PAGE:
      showProfilePage = false;
      return { ...state, showProfilePage };
    default:
      return { ...state };
  }
}
