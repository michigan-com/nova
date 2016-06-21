'use strict';

export const LOGOUT = 'LOGOUT';

export function logout() {
  return { type: LOGOUT };
}

export const USER_STATE = {
  userId: window.USER_ID ? window.USER_ID : null,
}
