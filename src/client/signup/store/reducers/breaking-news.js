'use strict';

import { DEFAULT_STATE, USER_SIGNED_UP, USER_WANTS_BREAKING_NEWS }
  from '../../actions/breaking-news';

export default function reducer(state = DEFAULT_STATE, action) {
  let userSignedUp;
  let userWantsBreakingNews;
  switch (action.type) {
    case USER_SIGNED_UP:
      userSignedUp = true;
      return { ...state, userSignedUp };
    case USER_WANTS_BREAKING_NEWS:
      userWantsBreakingNews = true;
      return { ...state, userWantsBreakingNews };
    default:
      return { ...state };
  }
}
