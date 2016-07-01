'use strict';

import React from 'react';

import { getRandomInt } from '../util/random';

export default class LoadingImage extends React.Component {

  constructor(props) {
    super(props);

    const blurbIndex = getRandomInt(0, this.props.blurbs.length - 1);
    this.state = {
      blurbIndex,
    };
  }
  renderBlurb() {
    if (this.state.blurbIndex < 0 || this.state.blurbIndex >= this.props.blurbs.length) return null;

    return this.props.blurbs[this.state.blurbIndex];
  }

  render() {
    return (
      <div className="loading-image">
        <div className="blurb-container">
          {this.props.blurbs[this.state.blurbIndex]}
        </div>
        <div className="loading-bars-container line-scale-party">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    );
  }
}

LoadingImage.propTypes = {
  blurbs: React.PropTypes.array,
  numBars: React.PropTypes.number,
  pulseInterval: React.PropTypes.number,
};

LoadingImage.defaultProps = {
  blurbs: ['Loading...', 'Starting flux capacitor...', 'Calculating jump to light speed...'],
  pulseInterval: 500,
  numBars: 3,
};
