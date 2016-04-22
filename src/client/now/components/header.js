'use strict';

import React from 'react';

import Store from '../store';
import { toggleInfo } from '../actions/article-list';

// Format thousands numbers
// http://blog.tompawlak.org/number-currency-formatting-javascript
function formatNumber(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

export default class Header extends React.Component {
  constructor(props) {
    super(props);
    this.userAuthenticated =  !!USER_ID;
  }

  renderLoginButton() {
    let loginContent = null;
    if (this.userAuthenticated) {
      loginContent = <a href='/logout/'>Logout</a>
    } else {
      loginContent = <a href='/login/'>Join</a>
    }

    return (
      <div className='user-area'>
        { loginContent }
      </div>
    )
  }

  render() {
    let readers = '';
    if (this.props.readers > 0) readers = `${formatNumber(this.props.readers)} now reading`;

    let siteInfoClass = 'site-info';
    if (this.props.showInfo) siteInfoClass += ' show';

    return(
      <div className='header-container'>
        <div id='header'>
          <div className={ siteInfoClass }>
            <div className='info-content'>
              <div className='close-header' onClick={ () => { Store.dispatch(toggleInfo()); } }>X</div>
              <p className='info-header'>{ `${this.props.appName} uses artificial intelligence to give you essential news in less time.` }</p>
              <div className='list'>
                <p>{ `${this.props.appName}'s algorithms surface the most-read Michigan news, in real-time.` }</p>
                <p>Its summarization engine distills each story down to the 3 details you need to know.</p>
                <p>The speed reader enables you to absorb the full story in a fraction of the normal time.</p>
              </div>
              <p className='feedback'>Feedback? We'd love to hear it.</p>
              <a href='mailto:bots@detroitnow.io' id='email-us'>Email Us</a>
            </div>
          </div>
          <div className='header-info'>
            <div id='page-header'>{ this.props.appName }</div>
            <div id='readers'>
              <div id='numbers'>{ `${readers}` }</div>
            </div>
            { this.renderLoginButton() }
          </div>
        </div>
      </div>
    )
  }
}
