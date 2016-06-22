'use strict';

export const USER_SIGNED_UP = 'USER_SIGNED_UP';
export const USER_WANTS_BREAKING_NEWS = 'USER_WANTS_BREAKING_NEWS';

function checkForBreakingNewsUrlParam() {
  const params = location.search.substr(1).split('&');
  for (const param of params) {
    const pair = param.split('=');
    if (pair[0].toLowerCase() === 'breakingnewssignup') return true;
  }
  return false;
}

const breakingNewsUrlParamPresent = checkForBreakingNewsUrlParam();

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
  breakingNewsSignupForm: breakingNewsUrlParamPresent,
  userWantsBreakingNews: breakingNewsUrlParamPresent,
  userSignedUp: false,
  userSignupError: '',
};
