'use strict';

import React from 'react';
import xr from 'xr';
import Toggle from 'material-ui/Toggle';

import Signup from './signup';
import { DEFAULT_STATE as DEFAULT_USER_STATE } from '../actions/user';
import { DEFAULT_SATTE as DEFAULT_SIGNUP_STATE } from '../actions/signup';

export default class ProfilePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      userInfo: null,
      loadingUserInfo: false,
    };

    this.fetchUserInfo = this.fetchUserInfo.bind(this);
    this.toggleBreakingNews = this.toggleBreakingNews.bind(this);
  }

  componentWillMount() {
    if (this.props.User.userId !== null) this.fetchUserInfo();
  }

  toggleBreakingNews() {
    if (this.state.userInfo === null) return;

    const userIsSignedUp = this.state.userInfo.breakingNewsSignup;
    const phoneNumber = this.state.userInfo.phoneNumber;
    let url = '';
    if (userIsSignedUp) url = '/user/breaking-news-signup-remove/';
    else url = '/user/breaking-news-signup/';

    xr.post(url, { phoneNumber }).then(
      () => {
        this.fetchUserInfo();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  fetchUserInfo() {
    if (this.props.User.userId === null) return;

    this.setState({ loadingUserInfo: true });
    const userId = this.props.User.userId;
    xr.get('/user/get-user-info/', { userId }).then(
      (resp) => {
        let userInfo = null;
        const loadingUserInfo = false;
        try {
          userInfo = resp;
        } catch (e) {
          console.log(e);
        } finally {
          this.setState({ userInfo, loadingUserInfo });
        }
      },
      (e) => {
        console.log(e);
        this.setState({ loadingUserInfo: false });
      }
    );
  }

  renderUserInfo() {
    if (this.state.loadingUserInfo && this.state.userInfo === null) {
      return (
        <div className="loading-user"><h3>Loading user info...</h3></div>
      );
    }

    let pageContent = null;
    if (this.state.userInfo === null) {
      pageContent = (
        <Signup
          dispatch={this.props.dispatch}
          Signup={this.props.Signup}
        />
      );
    } else {
      const userInfo = this.state.userInfo;
      const breakingNewsStatusClass = ['breaking-news-status'];
      pageContent = (
        <div className="profile-page">
          <div className="profile-title">{`Profile page for ${userInfo.phoneNumber}`}</div>
          <div className="profile-subtitle">Brought to you by robots</div>
          <div className="breaking-news-status">
            <Toggle
              defaultToggled={userInfo.breakingNewsSignup}
              label="Breaking News Alerts"
              onToggle={this.toggleBreakingNews}
              iconStyle={{
                textColor: 'white',
              }}
              style={{
                color: 'white',
              }}
            />
          </div>
          <div className="text-commands">
            <p>You can also text us any of these commands:</p>
            <div className="command">ALERTS ON - turn on breaking news alerts</div>
            <div className="command">ALERTS OFF - turn off breaking news alerts</div>
          </div>
        </div>
      );
    }

    return (
      <div className="profile-page-content">
        {pageContent}
      </div>
    );
  }

  renderHeader() {
    let headerText = '';
    if (this.state.loadingUserInfo) headerText = '';
    else if (this.state.userId === null) headerText = 'Sign Up';
    else headerText = 'Profile';

    return (
      <div className="profile-page-header">
        <div className="header-title">{headerText}</div>
        <div className="close-profile" onClick={this.props.onClose}>X</div>
      </div>
    );
  }


  render() {
    const profileClassName = ['profile-page-container'];
    if (this.props.User.showProfilePage) profileClassName.push('show');
    return (
      <div className={profileClassName.join(' ')}>
        {this.renderHeader()}
        {this.renderUserInfo()}
      </div>
    );
  }
}

ProfilePage.propTypes = {
  User: React.PropTypes.shape(DEFAULT_USER_STATE).isRequired,
  Signup: React.PropTypes.shape(DEFAULT_SIGNUP_STATE).isRequired,
  onClose: React.PropTypes.func,
};

ProfilePage.defaultProps = {
  onClose: () => {},
};
