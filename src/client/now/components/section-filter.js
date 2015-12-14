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
    let activeIconClass = 'active-icon';
    if (this.props.active) activeIconClass += ' active';

    return (
      <div className={ `section-filter ${this.props.name}` }>
        <div className='section-circle' onClick={ this.toggleFilter }>
          <div className='icon'><i className='fa fa-times'></i></div>
          <div className={ activeIconClass }><i className='fa fa-check'></i></div>
        </div>
        <div className='section-filter-name'>{ this.props.displayName || this.props.name }</div>
      </div>
    )
  }
}
