'use strict';

import React from 'react';

import Dispatcher from '../../dispatcher';
import { getArticleActions } from '../../store/article-store';

let actions = getArticleActions();

// This ended up being much less complicated than initially anticipated
export default class SectionFilter extends React.Component {

  toggleFilter = () => {
    Dispatcher.dispatch({
      type: actions.sectionSelect,
      sectionName: this.props.name
    });
  }

  render() {
    let filterClass = `section-filter ${this.props.name} ${this.props.active ? 'active' : 'inactive'}`;

    return (
      <div className={ filterClass } onClick={ this.toggleFilter }>
        <div className='section-filter-name'>{ this.props.name }</div>
      </div>
    )
  }
}
