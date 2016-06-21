'use strict';

import React from 'react';

export default class SpeedControl extends React.Component {
  static defaultProps = { speed: 200 }
  static maxSpeed = 1000;
  static speedStep = 25;
  constructor(props) {
    super(props);

    this.state = {
      drawBars: false,
    };
  }

  componentDidMount() {
    this.onMount();
  }

  componentWillUnmount() {
    this.parentNode.removeEventListener('scroll', this.updateSpeed);
  }

  onMount() {
    this.parentNode = this.refs['speed-control'].parentNode;

    const scrollLeft = this.props.speed;
    this.parentNode.scrollLeft = scrollLeft;
    this.parentNode.addEventListener('scroll', this.updateSpeed);
    this.setState({ drawBars: true });

    window.addEventListener('resize', () => { this.setState({ drawBars: true }); });
  }

  updateSpeed = (e) => {
    // Don't allow 0 wpm
    if (!this.parentNode.scrollLeft) {
      e.preventDefault();
      e.stopPropagation();
      this.parentNode.scrollLeft = 1;
    }

    this.props.updateSpeed(this.parentNode.scrollLeft);
  }

  renderSteps() {
    const numSteps = SpeedControl.maxSpeed / SpeedControl.speedStep;
    const steps = [];
    for (let i = 0; i <= numSteps; i++) {
      let speedVal = i * SpeedControl.speedStep;
      let style = { left: `${speedVal + (window.innerWidth / 2)}px` };

      let textContent = null;
      if (!(speedVal % 50)) textContent = (<span className="speed-val">{speedVal}</span>);

      steps.push(
        <div
          className="speed-control-step"
          key={`speed-control-step-${i}`}
          style={style}
        >
          {textContent}
        </div>
      );
    }
    return steps;
  }

  render() {
    let speedControlClass = 'speed-control';
    if (this.state.drawBars) speedControlClass += ' draw';

    let width = SpeedControl.maxSpeed;
    if (window.innerWidth > 768) width += (window.innerWidth * 0.75);
    else width += window.innerWidth;

    let style = { width: `${width}px` };
    return (
      <div className="speed-control-container">
        <div className={speedControlClass} ref="speed-control" style={style}>
          {this.renderSteps()}
        </div>
      </div>
    );
  }
}

SpeedControl.propTypes = {
  speed: React.PropTypes.number.isRequired,
  updateSpeed: React.PropTypes.func.isRequired,
};
