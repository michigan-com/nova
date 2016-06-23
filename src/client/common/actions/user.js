'use strict';

export const LOGOUT = 'LOGOUT';
export const SHOW_PROFILE_PAGE = 'SHOW_PROFILE_PAGE';
export const HIDE_PROFILE_PAGE = 'HIDE_PROFILE_PAGE';

export function logout() {
  return { type: LOGOUT };
}

export function showProfilePage() {
  return { type: SHOW_PROFILE_PAGE };
}

export function hideProfilePage() {
  return { type: HIDE_PROFILE_PAGE };
}

export const USER_STATE = {
  userId: window.USER_ID ? window.USER_ID : null,
  showProfilePage: false,
};
