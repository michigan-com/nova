'use strict';

import React from 'react';

import { getRandomInt } from '../../lib/random';

export default class LoadingImage extends React.Component {
  static defaultProps = {
    blurbs: ['Loading...', 'Starting flux capacitor...', 'Calculating jump to light speed...'],
  }

  constructor(props) {
    super(props);

    let blurbIndex = getRandomInt(0, this.props.blurbs.length - 1)
    this.state = {
      blurbIndex
    }
  }
  renderBlurb() {
    if (this.state.blurbIndex < 0 || this.state.blurbIndex >= this.props.blurbs.length) return null;

    return this.props.blurbs[this.state.blurbIndex]
  }

  render() {
    return (
      <div className='loading-image'>
        <div className='blurb-container'>
          { this.props.blurbs[this.state.blurbIndex] }
        </div>
        <div className='loading-bars-container line-scale-party'>
          <div> </div>
          <div> </div>
          <div> </div>
          <div> </div>
        </div>
      </div>
    )
  }
}
