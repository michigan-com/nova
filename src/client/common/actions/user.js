'use strict';

import xr from 'xr';

export const LOGOUT = 'LOGOUT';
export const SHOW_PROFILE_PAGE = 'SHOW_PROFILE_PAGE';
export const HIDE_PROFILE_PAGE = 'HIDE_PROFILE_PAGE';
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';

export function logout() {
  return dispatch => {
    xr.post('/logout/').then(
      () => { dispatch({ type: LOGOUT }); },
      (err) => { console.log(err); }
    );
  };
}

export function updateUserInfo(userInfo) {
  return {
    type: UPDATE_USER_INFO,
    value: userInfo,
  };
}

export function showProfilePage() {
  return { type: SHOW_PROFILE_PAGE };
}

export function hideProfilePage() {
  return { type: HIDE_PROFILE_PAGE };
}

export const USER_STATE = {
  userId: window.USER_ID ? window.USER_ID : null,
  userInfo: null,
  showProfilePage: false,
};
