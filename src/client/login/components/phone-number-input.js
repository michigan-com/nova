'use strict';

import React from 'react';
import xr from 'xr';

import Store from '../store';
import { phoneNumberInputChange, phoneNumberError } from '../actions/phone-number';

export default class PhoneNumberInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      phoneNumberSent: false,
      phoneNumber: '',
      code: '',
      error: '',
    };

    this.csrf = document.getElementById('csrf').value;

    this.checkCode = this.checkCode.bind(this);
    this.checkPhoneNumber = this.checkPhoneNumber.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  submitForm(e) {
    e.stopPropagation();
    e.preventDefault();

    const csrf = document.getElementById('csrf').value;
    const phoneNumber = this.props.PhoneNumber.phoneNumber;
    const code = this.state.code;

    if (phoneNumber.length !== 10) {
      Store.dispatch(
        phoneNumberError('Please include area code and phone number (10 numbers total)')
      );
      return;
    } else if (isNaN(phoneNumber)) {
      Store.dispatch(phoneNumberError('Only numbers, please'));
      return;
    }

    xr.post('/generate-login-code/', { phoneNumber, _csrf: csrf }).then(
      () => {
        this.setState({ phoneNumberSent: true, error: '' });
      },
      (err) => {
        const resp = JSON.parse(err.response);
        const error = resp.error;
        this.setState({ error });
      }
    );

    if (!this.state.phoneNumberSent) {
      // Generate the code
    } else {
      // Veryify the code
      xr.post('/login/', { phoneNumber, code, _csrf: csrf }).then(
        () => {
          window.location = window.location.origin;
        },
        () => {
          this.setState({ error: 'Invalid code, please try again' });
        }
      );
    }
  }

  validNumberInput(e) {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13) return false;

    e.stopPropagation();
    e.preventDefault();

    if ((keyCode > 57 || keyCode < 48) && keyCode !== 8) {
      this.setState(this.state);
      return false;
    }

    return true;
  }

  checkCode(e) {
    const keyCode = e.which || e.keyCode;
    if (!this.validNumberInput(e)) return;

    const newState = { ...this.state };
    const newVal = String.fromCharCode(keyCode);
    const oldCode = this.state.code;

    if (keyCode === 8) {
      newState.code = oldCode.slice(0, oldCode.length - 1);
    } else if (oldCode.length < 6) {
      newState.code += newVal;
    }
    this.setState(newState);
  }

  checkPhoneNumber(e) {
    const keyCode = e.which || e.keyCode;
    if (!this.validNumberInput(e)) {
      Store.dispatch(phoneNumberError('Numbers only, please'));
      return;
    }
    const newVal = String.fromCharCode(keyCode);
    const oldNumber = this.props.PhoneNumber.phoneNumber;
    let newNumber = oldNumber;

    if (keyCode === 8) {
      newNumber = oldNumber.slice(0, oldNumber.length - 1);
    } else {
      if (oldNumber.length < 10) {
        newNumber += newVal;
      } else {
        Store.dispatch(phoneNumberError('Phone numbers should be 10 numbers in length'));
        return;
      }
    }
    Store.dispatch(phoneNumberError(''));
    Store.dispatch(phoneNumberInputChange(newNumber));
  }

  renderFormContent() {
    let formContent = null;
    let inputClass = 'input';
    if (this.props.PhoneNumber.phoneNumberValidationError) inputClass += ' error';

    if (this.state.phoneNumberSent) {
      formContent = (
        <div className="form-content">
          <p>Great! We just texted you a 6 digit code, enter that in here and you'll be all set</p>
          <p>Phone number: <strong>{this.state.phoneNumber}</strong></p>
          <input
            type="text"
            className={inputClass}
            name="code"
            ref="code"
            value={this.state.code}
            onKeyDown={this.checkCode}
            placeholder="1234"
          />
        </div>
      );
    } else {
      formContent = (
        <div className="form-content">
          <p>Join the Detroit Now squad for access to more features.</p>
          <p>
            Enter your phone number to join. It's free! We'll text you a
            verification code just to make sure it's you.
          </p>
          <input
            type="text"
            className={inputClass}
            name="phoneNumber"
            ref="phoneNumber"
            value={this.props.PhoneNumber.phoneNumber}
            onKeyDown={this.checkPhoneNumber}
            placeholder="3135550123"
          />
        </div>
      );
    }

    return (
      <div>
        {formContent}
        <a className="tell-me-more" href="/pricing/">Tell me more about these features</a>
      </div>
    );
  }

  render() {
    return (
      <div className="phone-number-input">
        <div className="login-form-container">
          <h2>Get breaking news alerts delivered via SMS</h2>
          <form
            action="/login/"
            method="POST"
            ref="phoneNumberForm"
            onSubmit={this.submitForm}
          >
            {this.renderFormContent()}
            <div className="error-messages">
              {this.props.PhoneNumber.phoneNumberValidationError}
            </div>
            <input type="submit" value="Get The News" />
          </form>
        </div>
      </div>
    );
  }
}

PhoneNumberInput.propTypes = {
  PhoneNumber: React.PropTypes.object.isRequired,
};
