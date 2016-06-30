'use strict';

import { USER_STATE, LOGOUT, SHOW_PROFILE_PAGE, HIDE_PROFILE_PAGE, UPDATE_USER_INFO,
} from '../../actions/user';

export default function UserReducer(state = USER_STATE, action) {
  let userId;
  let showProfilePage;
  let userInfo;
  switch (action.type) {
    case LOGOUT:
      userId = null;
      userInfo = null;
      showProfilePage = false;
      return { ...state, userId, userInfo, showProfilePage };
    case SHOW_PROFILE_PAGE:
      showProfilePage = true;
      return { ...state, showProfilePage };
    case HIDE_PROFILE_PAGE:
      showProfilePage = false;
      return { ...state, showProfilePage };
    case UPDATE_USER_INFO:
      userInfo = action.value;
      userId = userInfo.userId;
      return { ...state, userInfo, userId };
    default:
      return { ...state };
  }
}
