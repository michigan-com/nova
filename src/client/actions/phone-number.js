'use strict';

import Cookies from 'cookies-js';

export const SHOW_INPUT = 'SHOW_INPUT';
export const DISMISS_INPUT = 'DISMISS_INPUT';
export const EXPAND_INPUT = 'EXPAND_INPUT';

export const HIDE_PHONE_INPUT_COOKIE  = 'hidePhoneInput';

function setHideInputCookie() {
  Cookies.set(HIDE_PHONE_INPUT_COOKIE, true, { expires: Infinity });
}

function getHideInputCookie() {
  let val = Cookies.get(HIDE_PHONE_INPUT_COOKIE);
  if (typeof val === 'undefined') return false;

  return val === "true";
}

export function showInput() {
  return { type: SHOW_INPUT };
}

export function dismissInput() {
  return { type: DISMISS_INPUT };
}

export function hideInputForever() {
  //setHideInputCookie();
  return { type: DISMISS_INPUT  }
}

export function expandInput() {
  return { type: EXPAND_INPUT }
}

export const DEFAULT_PHONE_NUMBER_STATE = {
  //showInput: !getHideInputCookie(),
  showInput: true,
  expandInput: false,
  dismissInput: false
}
