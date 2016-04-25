'use strict';

import React from 'react';
import { render } from 'react-dom';
import xr from 'xr';

import { appName } from '../../config';

class LoginForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      phoneNumberSent: false,
      phoneNumber: '',
      code: '',
      error: '',
    }

    this._csrf = document.getElementById('_csrf').value;
  }

  submitForm(e) {
    e.stopPropagation();
    e.preventDefault();

    let _csrf = document.getElementById('_csrf').value;
    let phoneNumber = this.state.phoneNumber;
    let code = this.state.code;

    if (phoneNumber.length != 10) {
      return this.setState({ error: 'Please include area code and phone number (10 numbers total)' })
    } else if (isNaN(phoneNumber)) {
      return this.setState({ error: 'Only numbers, please' });
    }

    if (!this.state.phoneNumberSent) {
      // Generate the code
      xr.post('/generate-login-code/', { phoneNumber, _csrf}).then(
        (resp) => {
          this.setState({ phoneNumberSent: true, error: '' });
        },
        (err) => {
          let resp = JSON.parse(err.response);
          let error = resp.error;
          this.setState({ error });
        }
      )
    } else {
      // Veryify the code

      xr.post('/login/', {phoneNumber, code, _csrf }).then(
        (resp) => {
          window.location = window.location.origin;
        },
        (err) => {
          this.setState({ error: 'Invalid code, please try again' });
        }
      )
    }
  }

  validNumberInput(e) {
    let keyCode = e.which || e.keyCode;
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
    let keyCode = e.which || e.keyCode;
    if (!this.validNumberInput(e)) return;

    let newState = { ...this.state }
    let newVal = String.fromCharCode(keyCode);
    let oldCode = this.state.code;

    if (keyCode == 8) {
      newState.code = oldCode.slice(0, oldCode.length - 1)
    } else if (oldCode.length < 6) {
      newState.code += newVal;
    }
    this.setState(newState);
  }

  checkPhoneNumber(e) {
    let keyCode = e.which || e.keyCode;
    if (!this.validNumberInput(e)) return;

    let newState = { ...this.state }
    let newVal = String.fromCharCode(keyCode);
    let oldNumber = this.state.phoneNumber

    if (keyCode == 8) {
      newState.phoneNumber = oldNumber.slice(0, oldNumber.length - 1)
    } else if (oldNumber.length < 10) {
      newState.phoneNumber += newVal;
    }
    this.setState(newState);
  }

  renderFormContent() {
    let formContent = null;
    let inputClass = 'input';
    if (this.state.error) inputClass += ' error';

    if (this.state.phoneNumberSent) {
      formContent = (
        <div className='form-content'>
          <p>Great! We just texted you a 6 digit code, enter that in here and you'll be all set</p>
          <p>Phone number: <strong>{ this.state.phoneNumber }</strong></p>
          <input type='text'
            className={ inputClass }
            name='code'
            ref='code'
            value={ this.state.code }
            onKeyDown={ this.checkCode.bind(this) }
            placeholder='1234'/>
        </div>
      )

    } else {
      formContent = (
        <div className='form-content'>
          <p>Join the Detroit Now squad for access to more features.</p>
          <p>Enter your phone number to join. It's free! We'll text you a verification code just to make sure it's you.</p>
          <input type='text'
            className={ inputClass }
            name='phoneNumber'
            ref='phoneNumber'
            value={ this.state.phoneNumber }
            onKeyDown={ this.checkPhoneNumber.bind(this) }
            placeholder='3135550123'/>
        </div>
      )
    }

    return (
      <div>
        <div className='login-form-container'>
          <h2>We do logins a little differently.</h2>
          <form action='/login/' method='POST' ref='phoneNumberForm' onSubmit={ this.submitForm.bind(this) }>
            { formContent }
            <div className='error-messages'>{ this.state.error }</div>
            <input type='submit' value='Submit' />
          </form>
        </div>
        <a className='tell-me-more' href='/pricing/'>Tell me more about these features</a>
      </div>
    )
  }

  render() {
    return (
      <div className='login'>
        { this.renderFormContent() }
      </div>
    )
  }
}

document.addEventListener('DOMContentLoaded', () => {
  render(
    <LoginForm/>,
    document.getElementById('login-form')
  );
});

