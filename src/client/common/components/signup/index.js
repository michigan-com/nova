'use strict';

import React from 'react';

import PhoneNumberInput from './phone-number-input';
import CodeInput from './code-input';
import { DEFAULT_STATE, unconfirmPhoneNumber, codeValidationError, codeInputChange,
  phoneNumberInputChange, phoneNumberError, codeConfirmed,
  confirmedPhoneNumber } from '../../actions/signup';

export default class Signup extends React.Component {
  constructor(props) {
    super(props);

    this.codeUpdate = this.codeUpdate.bind(this);
    this.phoneUpdate = this.phoneUpdate.bind(this);
  }

  codeUpdate(code, error) {
    if (error) this.props.dispatch(codeValidationError(error));
    else this.props.dispatch(codeInputChange(code));
  }

  phoneUpdate(phoneNumber, error) {
    if (error) this.props.dispatch(phoneNumberError(error));
    else this.props.dispatch(phoneNumberInputChange(phoneNumber));
  }

  renderSuccessPage() {
    return (
      <div className="success">
        <h2>Success!</h2>
        <a href="/">Back to home page</a>
      </div>
    );
  }

  renderLoginFormContent() {
    if (this.props.Signup.codeConfirmed) {
      return this.renderSuccessPage();
    }

    let formContent = null;
    const signupState = this.props.Signup;
    if (!signupState.phoneNumberConfirmed) {
      formContent = (
        <PhoneNumberInput
          Signup={this.props.Signup}
          onUpdate={this.phoneUpdate}
          onComplete={() => { this.props.dispatch(confirmedPhoneNumber()); }}
        />
      );
    } else {
      formContent = (
        <CodeInput
          Signup={this.props.Signup}
          onBack={() => { this.props.dispatch(unconfirmPhoneNumber()); }}
          onUpdate={this.codeUpdate}
          onComplete={() => { this.props.dispatch(codeConfirmed()); }}
        />
      );
    }
    return formContent;
  }

  render() {
    return (
      <div className="signup">
        {this.renderLoginFormContent()}
      </div>
    );
  }
}

Signup.propTypes = {
  Signup: React.PropTypes.shape(DEFAULT_STATE).isRequired,
  dispatch: React.PropTypes.func.isRequired,
};
