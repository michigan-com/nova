'use strict';

import React from 'react';
import { render } from 'react-dom';
import xr from 'xr';

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
    if (this.state.phoneNumber && this.state.code) return;

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
          this.setState({ phoneNumberSent: true });
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
          console.log('success');
        },
        (err) => {
          console.log(`error: ${err}`)
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

    if (this.state.phoneNumberSent) {
      formContent = (
        <div className='form-content'>
          <p>Great! We just texted you a 6 digit code, enter that in here and you'll be all set</p>
          <input type='hidden' name='phoneNumber' value={ this.state.phoneNumber }/>
          <input type='hidden' name='_csrf' value={ this._csrf }/>
          <input type='text'
            name='code'
            ref='code'
            value={ this.state.code }
            onKeyDown={ this.checkCode.bind(this) }
            placeholder='123456'/>
        </div>
      )

    } else {
      formContent = (
        <div className='form-content'>
          <p>Detroit Now is so mobile friendly, logging you in is as easy as sending a text message</p>
          <p>Input your phone number, and we'll send you a short code to make sure you actually are who you say you are, and we'll keep you logged in forever!</p>
            <input type='text'
              name='phoneNumber'
              ref='phoneNumber'
              value={ this.state.phoneNumber }
              onKeyDown={ this.checkPhoneNumber.bind(this) }
              placeholder='3135550123'/>
        </div>
      )
    }

    return (
      <div className='login-form-container'>
        <h2>We do logins a little differently.</h2>
        { this.state.error }
        <form action='/login/' method='POST' ref='phoneNumberForm' onSubmit={ this.submitForm.bind(this) }>
          { formContent }
          <input type='submit' value='Submit' />
        </form>
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

})

