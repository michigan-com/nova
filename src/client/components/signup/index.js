'use strict';

import React from 'react';
import xr from 'xr';

import PhoneNumberInput from './phone-number-input';
import CodeInput from './code-input';
import { unconfirmPhoneNumber, codeValidationError, codeInputChange,
  phoneNumberInputChange, phoneNumberError, confirmedPhoneNumber,
  userWantsBreakingNews, userDoesNotWantBreakingNews, userSignedUp } from '../../actions/signup';
import { updateUserInfo } from '../../actions/user';

export default class Signup extends React.Component {
  constructor(props) {
    super(props);

    this.codeUpdate = this.codeUpdate.bind(this);
    this.phoneUpdate = this.phoneUpdate.bind(this);
    this.breakingNewsToggle = this.breakingNewsToggle.bind(this);
    this.signupComplete = this.signupComplete.bind(this);
  }

  codeUpdate(code, error) {
    if (error) this.props.dispatch(codeValidationError(error));
    else this.props.dispatch(codeInputChange(code));
  }

  phoneUpdate(phoneNumber, error) {
    if (error) this.props.dispatch(phoneNumberError(error));
    else this.props.dispatch(phoneNumberInputChange(phoneNumber));
  }

  breakingNewsToggle() {
    if (this.props.Signup.userWantsBreakingNews) this.props.dispatch(userDoesNotWantBreakingNews());
    else this.props.dispatch(userWantsBreakingNews());
  }

  signupComplete() {
    this.props.dispatch(userSignedUp());
    xr.get('/user/get-user-info/').then(
      (resp) => {
        this.props.dispatch(updateUserInfo(resp));
      },
      (err) => {
        this.props.dispatch(codeValidationError(err));
      }
    );
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
    let formContent = null;
    const signupState = this.props.Signup;
    if (!signupState.phoneNumberConfirmed) {
      formContent = (
        <PhoneNumberInput
          Signup={this.props.Signup}
          onUpdate={this.phoneUpdate}
          onComplete={() => { this.props.dispatch(confirmedPhoneNumber()); }}
          onBreakingNewsToggle={this.breakingNewsToggle}
        />
      );
    } else {
      formContent = (
        <CodeInput
          Signup={this.props.Signup}
          onBack={() => { this.props.dispatch(unconfirmPhoneNumber()); }}
          onUpdate={this.codeUpdate}
          onComplete={this.signupComplete}
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
  Signup: React.PropTypes.object.isRequired,
  dispatch: React.PropTypes.func.isRequired,
};
