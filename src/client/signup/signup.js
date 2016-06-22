'use strict';

import React from 'react';

import PhoneNumberInput from './components/phone-number-input';
import CodeInput from './components/code-input';
import Header from '../common/components/header';

import Config from '../../../config';

export default class Signup extends React.Component {
  // constructor(props) {
  //   super(props);
  // }

  renderSuccessPage() {
    return (
      <div className="success">
        <h2>Success!</h2>
        <a href="/">Back to home page</a>
      </div>
    );
  }

  renderLoginFormContent() {
    if (this.props.store.Code.codeConfirmed) {
      return this.renderSuccessPage();
    }

    let formContent = null;
    const phoneNumberState = this.props.store.PhoneNumber;
    const codeState = this.props.store.Code;
    const breakingNewsState = this.props.store.BreakingNews;
    if (!phoneNumberState.phoneNumberConfirmed) {
      formContent = (
        <PhoneNumberInput
          PhoneNumber={phoneNumberState}
          BreakingNews={breakingNewsState}
        />
      );
    } else {
      formContent = (
        <CodeInput
          PhoneNumber={phoneNumberState}
          Code={codeState}
          BreakingNews={breakingNewsState}
        />
      );
    }
    return formContent;
  }

  render() {
    return (
      <div className="signup">
        <Header appName={Config.appName} userId={this.props.store.User.userId} />
        {this.renderLoginFormContent()}
      </div>
    );
  }
}

Signup.propTypes = {
  store: React.PropTypes.object.isRequired,
};
