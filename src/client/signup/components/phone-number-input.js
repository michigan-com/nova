'use strict';

import React from 'react';
import xr from 'xr';

import Store from '../store';
import { phoneNumberInputChange, phoneNumberError, confirmedPhoneNumber }
  from '../actions/phone-number';

export default class PhoneNumberInput extends React.Component {
  constructor(props) {
    super(props);

    this.csrf = document.getElementById('_csrf').value;

    this.checkPhoneNumber = this.checkPhoneNumber.bind(this);
    this.submitForm = this.submitForm.bind(this);
  }

  submitForm(e) {
    e.stopPropagation();
    e.preventDefault();

    const csrf = this.csrf;
    const phoneNumber = this.props.PhoneNumber.phoneNumber;
    // const code = this.state.code;

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
        Store.dispatch(confirmedPhoneNumber());
      },
      (err) => {
        const resp = JSON.parse(err.response);
        const error = resp.error;
        Store.dispatch(phoneNumberError(error));
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

  checkPhoneNumber(e) {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13) return;
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
    let inputClass = 'input';
    if (this.props.PhoneNumber.phoneNumberValidationError) inputClass += ' error';

    return (
      <div className="form-content">
        <p>Enter your mobile number</p>
        <input
          type="text"
          className={inputClass}
          name="phoneNumber"
          ref={(input) => {
            if (input) input.focus();
          }}
          value={this.props.PhoneNumber.phoneNumber}
          onKeyDown={this.checkPhoneNumber}
          placeholder="3135550123"
        />
      </div>
    );
  }

  renderFormHeader() {
    let content = null;
    if (this.props.BreakingNews.breakingNewsSignupDone) {
      content = (
        <div className="form-header">
          <h2 className="form-title">Get breaking news alerts delivered via SMS</h2>
          <img
            className="breaking-news-example"
            src="/img/breaking-news-example.png"
            alt="Breaking News"
          />
        </div>
      );
    }
    return content;
  }

  render() {
    return (
      <div className="phone-number-input">
        <div className="login-form-container">
          {this.renderFormHeader()}
          <form
            action="/generate-login-code/"
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
  BreakingNews: React.PropTypes.object.isRequired,
};
