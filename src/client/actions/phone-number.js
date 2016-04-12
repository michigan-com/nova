'use strict';

export const SHOW_INPUT = 'SHOW_INPUT';
export const DISMISS_INPUT = 'DISMISS_INPUT';

export function showInput() {
  return { type: SHOW_INPUT };
}

export function dismissInput() {
  return { type: DISMISS_INPUT };
}

export const DEFAULT_PHONE_NUMBER_STATE = {
  showInput: false,
  dismissInput: false
}