'use strict';

import React from 'react';

import Store from '../store';
import { sectionSelect } from '../actions/filters';

// This ended up being much less complicated than initially anticipated
export default class SectionFilter extends React.Component {

  toggleFilter = () => { Store.dispatch(sectionSelect(this.props.name, this.props.active)); }

  render() {
    let sectionFilterClass = `section-filter ${this.props.name}`;
    if (this.props.active) sectionFilterClass += ' active';

    return (
      <div className={sectionFilterClass}>
        <div className="section-circle" onClick={this.toggleFilter}>
          <div className="icon">
            <img src={`/img/${this.props.name}.svg`} alt={`${this.props.name}`} />
          </div>
          <div className="active-icon">
            <img src={'/img/check.svg'} alt="Active" />
          </div>
        </div>
        <div className="section-filter-name">{this.props.displayName || this.props.name}</div>
      </div>
    );
  }
}

SectionFilter.propTypes = {
  name: React.PropTypes.string.isRequired,
  active: React.PropTypes.bool.isRequired,
  displayName: React.PropTypes.string,
};
