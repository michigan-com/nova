'use strict';

import React from 'react';

import Store from '../store';
import { TOP_ARTICLES, STREAM_ARTICLES, changeView } from '../actions/nav';
import SectionFilters from './filters';

export default class UserNav extends React.Component {
  constructor(props) {
    super(props);

    this.changeView = this.changeView.bind(this);
  }

  changeView(option) {
    return () => {
      Store.dispatch(changeView(option));
    };
  }

  renderFilters() {
    if (this.context.User.userId === null) return null;

    return <SectionFilters sections={this.props.sections} />;
  }


  renderNavOptions() {
    const navOptions = [];
    for (const option of UserNav.navOptions) {
      const navOptionClass = ['nav-option'];
      if (this.props.Nav.currentView === option) navOptionClass.push('active');
      navOptions.push(
        <div
          className={navOptionClass.join(' ')}
          onClick={this.changeView(option)}
          key={`nav-option-${option}`}
        >
          <div className="nav-option-display-name">
            {UserNav.navOptionDisplayNames[option]}
          </div>
        </div>
      );
    }

    return (
      <div className="nav-options">
        {navOptions}
      </div>
    );
  }

  render() {
    return (
      <div className="user-nav">
        {this.renderNavOptions()}
        {this.renderFilters()}
      </div>
    );
  }
}

UserNav.navOptions = [TOP_ARTICLES, STREAM_ARTICLES];
UserNav.navOptionDisplayNames = {
  TOP_ARTICLES: 'Top',
  STREAM_ARTICLES: 'Stream',
};

UserNav.propTypes = {
  sections: React.PropTypes.array.isRequired,
  Nav: React.PropTypes.object.isRequired,
};

UserNav.contextTypes = {
  User: React.PropTypes.object,
};
