'use strict';

import React from 'react';
import { findDOMNode } from 'react-dom';
import xr from 'xr';

import Store from '../store';
import { showInput, dismissInput, hideInputForever, expandInput } from '../actions/phone-number';
import { getTopArticleStyle } from './top-article';

export default class PhoneNumberInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      error: '',
      sendingMessage: false,
      messageSent: false,
      phoneNumber: '',
    };

    this.checkKeyValue = this.checkKeyValue.bind(this);
    this.submitNumber = this.submitNumber.bind(this);
  }

  componentDidMount() {
    if (this.shouldShowInput) {
      // setTimeout(() => { Store.dispatch(showInput()); }, 2500);
      Store.dispatch(showInput());
    }
  }

  componentDidUpdate(lastProps) {
    if (this.props.expandInput && !lastProps.expandInput) {
      findDOMNode(this.refs['phone-number']).focus();
    }
  }

  submitNumber(e) {
    e.preventDefault();
    e.stopPropagation();

    if (!this.props.expandInput) {
      Store.dispatch(expandInput());
      return;
    }

    const csrf = document.getElementById('_csrf').value;
    const phoneNumber = this.state.phoneNumber;

    if (phoneNumber.length !== 10) {
      this.setState({ error: 'Please include area code and phone number (10 numbers total)' });
      return;
    } else if (isNaN(phoneNumber)) {
      this.setState({ error: 'Only numbers, please' });
      return;
    }

    this.setState({
      error: '',
      sendingMessage: true,
    });

    xr.post('/text-mobile-link/', { phoneNumber, _csrf: csrf }).then(
      () => {
        this.setState({
          error: '',
          sendingMessage: false,
          messageSent: true,
        });

        setTimeout(() => { Store.dispatch(hideInputForever()); }, 2000);
      },
      (err) => {
        const resp = JSON.parse(err.response);

        this.setState({
          error: resp.error,
        });
      }
    );
  }

  checkKeyValue(e) {
    const keyCode = e.which || e.keyCode;
    if (keyCode === 13) return;

    e.stopPropagation();
    e.preventDefault();

    if ((keyCode > 57 || keyCode < 48) && keyCode !== 8) {
      this.setState(this.state);
      return;
    }

    const newState = { ...this.state };
    const newVal = String.fromCharCode(keyCode);
    const oldNumber = this.state.phoneNumber;

    if (keyCode === 8) {
      newState.phoneNumber = oldNumber.slice(0, oldNumber.length - 1);
    } else if (oldNumber.length < 10) {
      newState.phoneNumber += newVal;
    }
    this.setState(newState);
  }

  dismissInput() {
    Store.dispatch(dismissInput());
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

    if (!this.props.expandInput) submitValue = 'Sure!';
    if (this.state.sendingMessage) {
      submitClass += ' disabled';
      submitValue = 'Texting...';
    } else if (this.state.messageSent) {
      submitClass += ' disabled';
      submitValue = 'Sent!';
    }

    if (this.props.expandInput) {
      let phoneNumberInputClass = 'phone-number-input';
      if (this.state.error) phoneNumberInputClass += ' error';

      content = (
        <input
          type="text"
          ref="phone-number"
          className={phoneNumberInputClass}
          placeholder="3135550123"
          value={this.state.phoneNumber}
          onKeyDown={this.checkKeyValue}
        />
      );
    } else {
      content = (
        <p className="blurb">
          We tailored this experience for mobile phones. Can we text you a link?
        </p>
      );
    }

    let formContentClass = 'form-content';
    if (this.props.expandInput) formContentClass += ' expand';

    let style = {};
    style.animationDelay = `${this.props.rank * 50}ms`;
    return (
      <div className="phone-number-input-content" style={style}>
        <form onSubmit={this.submitNumber}>
          <div className={formContentClass}>
            <div className="errors">{this.state.error || ' '}</div>
            {content}
            <p className="blurb">We will never spam or share your number.</p>
          </div>
          <div className="form-submit">
            <input
              type="submit"
              className={submitClass}
              value={submitValue}
              onClick={this.submitNumber}
            />
          </div>
        </form>
      </div>
    );
  }

  render() {
    let className = 'phone-number-input-container';

    let style = getTopArticleStyle(this.props.rank);
    if (this.props.expandInput) style.height *= 2;
    return (
      <div className={className} style={style}>
        {this.renderContent()}
      </div>
    );
  }
}

PhoneNumberInput.propTypes = {
  expandInput: React.PropTypes.bool.isRequired,
  rank: React.PropTypes.number.isRequired,
};
