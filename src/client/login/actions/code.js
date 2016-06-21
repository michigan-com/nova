'use strict';

export const CODE_INPUT_CHANGE = 'CODE_INPUT_CHANGE';
export const CODE_GENERATED = 'CODE_GENERATED';

export function codeGenerated() {
  return {
    type: CODE_GENERATED,
  };
}

export function codeInputChange(code = '') {
  return {
    type: CODE_INPUT_CHANGE,
    value: code,
  };
}

export function codeConfirmed() {
  return {

  };
}

export const DEFAULT_STATE = {
  code: '',
  codeGenerated: false,
  codeConfirmed: false,
};
