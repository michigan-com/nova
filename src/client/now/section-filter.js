'use strict';

import React from 'react';

import Dispatcher from '../dispatcher';
import { getArticleActions } from '../store/article-store';

let actions = getArticleActions();

export default class SectionFilter extends React.Component {

  toggleFilter = () => {
    Dispatcher.dispatch({
      type: actions.filterToggle,
      filterName: this.props.name
    });
  }

  render() {
    let filterClass = `section-filter ${this.props.name}`;
    let filterToggleClass = `section-filter-toggle ${this.props.active ? 'active' : 'inactive'}`;

    return (
      <div className={ filterClass } onClick={ this.toggleFilter }>
        <div className='section-filter-name'>{ this.props.displayName || this.props.name }</div>
        <div className={ filterToggleClass }></div>
      </div>
    )
  }
}
