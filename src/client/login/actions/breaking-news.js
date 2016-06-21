'use strict';

export const USER_SIGNED_UP = 'USER_SIGNED_UP';
export const USER_WANTS_BREAKING_NEWS = 'USER_WANTS_BREAKING_NEWS';

export function userSignedUp() {
  return {
    type: USER_SIGNED_UP,
  };
}

export function userWantsBreakingNews() {
  return {
    type: USER_WANTS_BREAKING_NEWS,
  };
}

export const DEFAULT_STATE = {
  userWantsBreakingNews: false,
  userSignedUp: false,
};
