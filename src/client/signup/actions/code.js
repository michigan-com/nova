'use strict';

export const CODE_INPUT_CHANGE = 'CODE_INPUT_CHANGE';
export const CODE_GENERATED = 'CODE_GENERATED';
export const CODE_CONFIRMED = 'CODE_CONFIRMED';
export const CODE_VALIDATION_ERROR = 'CODE_VALIDATION_ERROR';

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
    type: CODE_CONFIRMED,
  };
}

export function codeValidationError(error = '') {
  return {
    type: CODE_VALIDATION_ERROR,
    value: error,
  };
}

export const DEFAULT_STATE = {
  code: '',
  codeGenerated: false,
  codeConfirmed: false,
  codeValidationErrorMessage: '',
};
