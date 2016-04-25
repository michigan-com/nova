'use strict';

import React from 'react';
import { findDOMNode } from 'react-dom';
import xr from 'xr';

import Store from '../../store';
import { showInput, dismissInput, hideInputForever } from '../../actions/phone-number';
import { getTopArticleStyle } from './top-article';

export default class PhoneNumberInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      showForm: false,
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
    if (this.state.showForm && !lastState.showForm) {
      findDOMNode(this.refs['phone-number']).focus();
    }
  }

  submitNumber(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.state.showForm) {
      return this.setState({ showForm: true });
    }

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

    xr.post('/text-mobile-link/', { phoneNumber }).then(
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
    e.stopPropagation();
    e.preventDefault();

    let keyCode = e.which || e.keyCode;
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

  showForm(e) {
    this.setState({ showForm: true });
  }

  hideForever(e) {
    e.preventDefault();
    e.stopPropagation();
    Store.dispatch(hideInputForever());
  }

  renderContent() {
    let content = null;
    let submitClass = 'submit';
    let submitValue = 'Text Me';

    if (!this.state.showForm) submitValue = 'Sure!';
    if (this.state.sendingMessage) {
      submitClass += ' disabled';
      submitValue = 'Texting...'
    } else if (this.state.messageSent) {
      submitClass += ' disabled';
      submitValue = 'Sent!';
    }

    if (this.state.showForm) {
      let phoneNumberInputClass = 'phone-number-input';
      if (this.state.error) phoneNumberInputClass += ' error';

      content = (
        <input type='text'
          ref='phone-number'
          className={ phoneNumberInputClass }
          placeholder='3135550123'
          value={ this.state.phoneNumber }
          onKeyDown={ this.checkKeyValue.bind(this) }/>
      );
    } else {
      content = (
        <p className='blurb'>We tailored this experience for mobile phones. Can we text you a link?</p>
      );
    }

    let style = {};
    style.animationDelay = `${this.props.rank * 50}ms`;
    return (
      <div className='phone-number-input-content' style={ style }>
        <form onSubmit={ this.submitNumber.bind(this) }>
          <div className='form-content'>
            { content }
            <p className='blurb'>We will never spam or share your number.</p>
            <div className='errors'>{ this.state.error }</div>
          </div>
          <div className='form-submit'>
            <input type='submit' className={ submitClass } value={ submitValue }/>
          </div>
        </form>
      </div>
    )
  }

  render() {
    let className = 'phone-number-input-container';

    let style = getTopArticleStyle(this.props.rank);
    style.height *= 2;
    return (
      <div className={ className } style={ style }>
        { this.renderContent() }
      </div>
    )
  }
}
