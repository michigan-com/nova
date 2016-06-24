'use strict';

import React from 'react';
import xr from 'xr';
import Toggle from 'material-ui/Toggle';

import { DEFAULT_STATE } from '../../actions/signup';

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
    const phoneNumber = this.props.Signup.phoneNumber;
    // const code = this.state.code;

    if (phoneNumber.length !== 10) {
      this.props.onUpdate(
        phoneNumber,
        'Please include area code and phone number (10 numbers total)'
      );
      return;
    } else if (isNaN(phoneNumber)) {
      this.props.onUpdate(phoneNumber, 'Only numbers, please');
      return;
    }

    xr.post('/generate-login-code/', { phoneNumber, _csrf: csrf }).then(
      () => {
        this.props.onComplete();
      },
      (err) => {
        const resp = JSON.parse(err.response);
        const error = resp.error;
        this.props.onUpdate(phoneNumber, `${error}`);
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
    const newVal = String.fromCharCode(keyCode);
    const oldNumber = this.props.Signup.phoneNumber;
    let newNumber = oldNumber;

    if (keyCode === 13) return;
    if (!this.validNumberInput(e)) {
      this.props.onUpdate(oldNumber, 'Numbers only, please');
      return;
    }

    if (keyCode === 8) {
      newNumber = oldNumber.slice(0, oldNumber.length - 1);
    } else {
      if (oldNumber.length < 10) {
        newNumber += newVal;
      } else {
        this.props.onUpdate(oldNumber, 'Phone numbers should be 10 numbers in length');
        return;
      }
    }
    this.props.onUpdate(newNumber, '');
  }

  renderFormContent() {
    let inputClass = 'input';
    if (this.props.Signup.phoneNumberValidationError) inputClass += ' error';

    return (
      <div className="form-content">
        <input
          type="text"
          className={inputClass}
          name="phoneNumber"
          value={this.props.Signup.phoneNumber}
          onKeyDown={this.checkPhoneNumber}
          placeholder="Enter your mobile number"
        />
      </div>
    );
  }

  renderFormHeader() {
    let content = null;
    if (this.props.Signup.breakingNewsSignup) {
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
    } else {
      content = (
        <div className="form-header">
          <h2 className="form-title">
            Detroit Now uses AI to give you essential news in less time.
          </h2>
          <div className="breaking-news-status">
            <Toggle
              defaultToggled={this.props.Signup.userWantsBreakingNews}
              label="Subscribe To Breaking News Alerts"
              onToggle={this.props.onBreakingNewsToggle}
            />
          </div>
        </div>
      );
    }
    return content;
  }

  render() {
    return (
      <div className="phone-number-signup">
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
              {this.props.Signup.phoneNumberValidationError}
            </div>
            <input type="submit" value="Get The News" />
          </form>
        </div>
      </div>
    );
  }
}

PhoneNumberInput.propTypes = {
  onComplete: React.PropTypes.func.isRequired,
  onUpdate: React.PropTypes.func.isRequired,
  onBreakingNewsToggle: React.PropTypes.func,
  Signup: React.PropTypes.shape(DEFAULT_STATE).isRequired,
};
