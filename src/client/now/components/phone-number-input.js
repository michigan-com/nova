'use strict';

import React from 'react';
import { findDOMNode } from 'react-dom';
import uaParser from 'ua-parser-js';
import xr from 'xr';

import Store from '../store';
import { showInput, dismissInput, hideInputForever } from '../actions/phone-number';

export default class PhoneNumberInput extends React.Component {
  constructor(props) {
    super(props);

    this.shouldShowInput = this.parseUaString();

    this.state = {
      buttonPress: false,
      error: '',
      sendingMessage: false,
      messageSent: false,
      phoneNumber: ''
    }
  }

  componentDidMount() {
    if (this.shouldShowInput) {
      //setTimeout(() => { Store.dispatch(showInput()); }, 2500);
      Store.dispatch(showInput());
    }
  }

  componentDidUpdate(lastProps, lastState) {
    if (this.state.buttonPress && !lastState.buttonPress) {
      findDOMNode(this.refs['phone-number']).focus();
    }
  }

  /**
   *  Determins if we need to show a input box for phone numbers. If on desktop,
   *  show the input. Else, don't show input
   *
   *  @return {Boolean} True if we're to show the input, false otherwise
   */
  parseUaString() {
    let uaResult = uaParser();
    return typeof uaResult.device.type === 'undefined' && this.props.showInput;
  }

  submitNumber(e) {
    e.preventDefault();
    e.stopPropagation();

    let _csrf = document.getElementById('_csrf').value;
    let phoneNumber = this.state.phoneNumber;

    if (phoneNumber.length != 10) {
      return this.setState({ error: 'Please include area code and phone number (10 numbers total)' })
    } else if (isNaN(phoneNumber)) {
      return this.setState({ error: 'Only numbers, please' });
    }

    this.setState({
      error: '',
      sendingMessage: true
    });

    xr.post('/text-mobile-link/', { phoneNumber, _csrf }).then(
      (resp) => {
        this.setState({
          error: '',
          sendingMessage: false,
          messageSent: true,
        });

        setTimeout(() => { Store.dispatch(hideInputForever()); }, 2000);
      },
      (err) => {
        let resp = JSON.parse(err.response);

        this.setState({
          error: resp.error
        });
      }
    )
  }

  checkKeyValue(e) {
    let keyCode = e.which || e.keyCode;
    if (keyCode === 13) return;

    e.stopPropagation();
    e.preventDefault();

    if ((keyCode > 57 || keyCode < 48) && keyCode !== 8) {
      this.setState(this.state);
      return;
    }

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

  dismissInput() {
    Store.dispatch(dismissInput());
  }

  buttonPress(e) {
    this.setState({ buttonPress: true });
  }

  hideForever(e) {
    e.preventDefault();
    e.stopPropagation();
    Store.dispatch(hideInputForever());
  }

  renderContent() {
    let content = null;
    if (this.state.buttonPress) {
      let phoneNumberInputClass = 'phone-number-input';
      if (this.state.error) phoneNumberInputClass += ' error';

      let submitClass = 'submit';
      let submitValue = 'Text me';
      if (this.state.sendingMessage) {
        submitClass += ' disabled';
        submitValue = 'Texting...'
      } else if (this.state.messageSent) {
        submitClass += ' disabled';
        submitValue = 'Sent!';
      }
      content = (
        <div className='phone-number-form'>
          <form onSubmit={ this.submitNumber.bind(this) }>
            <input type='text'
              ref='phone-number'
              className={ phoneNumberInputClass }
              placeholder='3135550123'
              value={ this.state.phoneNumber }
              onKeyDown={ this.checkKeyValue.bind(this) }/>
            <div className='errors'>{ this.state.error }</div>
            <input type='submit' className={ submitClass } value={ submitValue }/>
            <div className='info-text'>We will never spam or share your number.</div>
          </form>
        </div>
      );
    } else {
      content = (
        <div className='reveal-form'>
          <h3>We tailored this experience for mobile phones.</h3>
          <h3>Can we text you a link?</h3>
          <div className='reveal-button' onClick={ this.buttonPress.bind(this) }>Click to enter your number</div>
          <a className='never-again' href='#' onClick={ this.hideForever.bind(this) }>Never show me again</a>
        </div>
      );
    }

    return (
      <div className='phone-number-input-content'>
        { content }
      </div>
    )
  }

  render() {
    if (!this.shouldShowInput) return null;

    let className = 'phone-number-input-container';
    if (this.props.showInput) className += ' show';
    if (this.props.dismissInput) className += ' dismiss';
    return (
      <div className={ className }>
        <div className='dismiss-input' onClick={ this.dismissInput.bind(this) }></div>
        { this.renderContent() }
      </div>
    )
  }
}
