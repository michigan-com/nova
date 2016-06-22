'use strict';

import React from 'react';
import xr from 'xr';

import Store from '../store';
import { codeValidationError, codeInputChange, codeConfirmed } from '../actions/code';
import { userSignedUp } from '../actions/breaking-news';

export default class CodeInput extends React.Component {
  constructor(props) {
    super(props);

    this.csrf = document.getElementById('_csrf').value;

    this.checkCode = this.checkCode.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  handlePostLogin() {
    // First, need to check if the user wants breaking news. If they do,
    // add them
    if (!this.props.BreakingNews.userWantsBreakingNews) {
      Store.dispatch(codeConfirmed());
      return;
    }

    const phoneNumber = this.props.PhoneNumber.phoneNumber;
    xr.post('/breaking-news-signup/', { phoneNumber, _csrf: this.csrf }).then(
      () => {
        Store.dispatch(userSignedUp());
        Store.dispatch(codeConfirmed());
      },
      (err) => {
        console.error(err);
      }
    );
  }

  validNumberInput(e) {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13) return false;

    e.stopPropagation();
    e.preventDefault();

    if ((keyCode > 57 || keyCode < 48) && keyCode !== 8) {
      return false;
    }
    return true;
  }

  checkCode(e) {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13) return;
    if (!this.validNumberInput(e)) {
      Store.dispatch(codeValidationError('Numbers only, please'));
      return;
    }
    const newVal = String.fromCharCode(keyCode);
    const oldCode = this.props.Code.code;
    let newCode = oldCode;
    if (keyCode === 8) {
      newCode = oldCode.slice(0, oldCode.length - 1);
    } else {
      if (oldCode.length < 4) {
        newCode += newVal;
      } else {
        Store.dispatch(codeValidationError('The code should be 4 numbers in length'));
        return;
      }
    }
    Store.dispatch(codeValidationError(''));
    Store.dispatch(codeInputChange(newCode));
  }

  submitForm(e) {
    e.preventDefault();
    e.stopPropagation();

    const phoneNumber = this.props.PhoneNumber.phoneNumber;
    const code = this.props.Code.code;

    xr.post('/login/', { phoneNumber, code, _csrf: this.csrf }).then(
      () => {
        // window.location = window.location.origin;
        this.handlePostLogin();
      },
      () => {
        Store.dispatch(codeValidationError('Invalid code, please try again'));
      }
    );
  }

  render() {
    let inputClass = 'input';
    if (this.props.Code.codeValidationErrorMessage) inputClass += ' error';

    return (
      <div className="code-input-form">
        <h2 className="form-title">Enter the 4 digit code we texted to verify your mobile #</h2>
        <form
          action="/login/"
          method="POST"
          ref="codeInputForm"
          onSubmit={this.submitForm}
        >
          <p>Enter verification code</p>
          <input
            type="text"
            className={inputClass}
            name="code"
            ref="code"
            value={this.props.Code.code}
            onKeyDown={this.checkCode}
            placeholder="1234"
          />

          <div className="error-messages">
            {this.props.Code.codeValidationErrorMessage}
          </div>
          <input type="submit" value="Verify" />
        </form>
      </div>
    );
  }
}

CodeInput.propTypes = {
  Code: React.PropTypes.object.isRequired,
  PhoneNumber: React.PropTypes.object.isRequired,
  BreakingNews: React.PropTypes.object.isRequired,
};
