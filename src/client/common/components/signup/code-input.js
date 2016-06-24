'use strict';

import React from 'react';
import xr from 'xr';

import { DEFAULT_STATE } from '../../actions/signup';
import { formatPhoneNumber } from '../../../util/format';

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
    if (!this.props.Signup.userWantsBreakingNews) {
      this.props.onComplete();
      return;
    }

    const phoneNumber = this.props.Signup.phoneNumber;
    xr.post('/breaking-news-signup/', { phoneNumber, _csrf: this.csrf }).then(
      () => {
        this.props.onComplete();
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
    const newVal = String.fromCharCode(keyCode);
    const oldCode = this.props.Signup.code;
    let newCode = oldCode;

    if (keyCode === 13) return;
    if (!this.validNumberInput(e)) {
      this.props.onUpdate(oldCode, 'Numbers only, please');
      return;
    }
    if (keyCode === 8) {
      newCode = oldCode.slice(0, oldCode.length - 1);
    } else {
      if (oldCode.length < 4) {
        newCode += newVal;
      } else {
        this.props.onUpdate(oldCode, 'The code should be 4 numbers in length');
        return;
      }
    }
    this.props.onUpdate(newCode, '');
  }

  submitForm(e) {
    e.preventDefault();
    e.stopPropagation();

    const phoneNumber = this.props.Signup.phoneNumber;
    const code = this.props.Signup.code;

    xr.post('/login/', { phoneNumber, code, _csrf: this.csrf }).then(
      () => {
        // window.location = window.location.origin;
        this.handlePostLogin();
      },
      () => {
        this.props.onUpdate(code, 'Invalid code, please try again');
      }
    );
  }

  render() {
    let inputClass = 'input';
    if (this.props.Signup.codeValidationErrorMessage) inputClass += ' error';

    return (
      <div className="code-input-form">
        <h2 className="form-title">Enter the 4 digit code we texted to verify your mobile #</h2>
        <div className="current-phone-number">
          {formatPhoneNumber(this.props.Signup.phoneNumber)}
        </div>
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
            ref={(input) => {
              if (input) input.focus();
            }}
            value={this.props.Signup.code}
            onKeyDown={this.checkCode}
            placeholder="1234"
          />

          <div className="error-messages">
            {this.props.Signup.codeValidationErrorMessage}
          </div>
          <input type="submit" value="Verify" />
          <div className="back-button" onClick={this.props.onBack}>Back To Phone Input</div>
        </form>
      </div>
    );
  }
}

CodeInput.propTypes = {
  Signup: React.PropTypes.shape(DEFAULT_STATE).isRequired,
  onUpdate: React.PropTypes.func.isRequired,
  onComplete: React.PropTypes.func.isRequired,
  onBack: React.PropTypes.func.isRequired,
};
