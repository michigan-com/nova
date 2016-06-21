'use strict';

import React from 'react';

import { getRandomInt } from '../../lib/random';

export default class LoadingImage extends React.Component {

  constructor(props) {
    super(props);

    let blurbIndex = -1;
    if (this.props.blurbs.length) blurbIndex = getRandomInt(0, this.props.blurbs.length - 1);

    this.state = {
      pulsingIndex: -1,
      blurbIndex,
    };
  }

  componentDidMount() {
    this.pulse();
  }

  componentWillUnmount() {
    clearTimeout(this.pulseTimeout);
  }

  pulse() {
    let pulsingIndex = this.state.pulsingIndex;
    if (pulsingIndex + 1 === this.props.numBars) {
      pulsingIndex = 0;
    } else {
      pulsingIndex += 1;
    }

    this.setState({ pulsingIndex });

    this.pulseTimeout = setTimeout(() => { this.pulse(); }, this.props.pulseInterval);
  }

  renderBars() {
    const bars = [];
    for (let i = 0; i < this.props.numBars; i++) {
      let className = 'bar';
      if (this.state.pulsingIndex === i) className += ' pulse';
      bars.push(<div className={className} key={`bar-${i}`}></div>);
    }
    return bars;
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
        <div className="loading-bars-container">
          {this.renderBars()}
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
