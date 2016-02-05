'use strict';

import React from 'react';
import { SimpleReader } from 'reeeeeader';

import Store from '../../store';
import { stopSpeedReading } from '../../actions/active-article';

export default class SpeedReader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      speedReaderFadeIn: false,
      playing: true,
      countdown: false,
      countdownIndex: null
    }

    this.countdownTime = 3;
    this.controller = null;
    this.countdownTimeout = undefined;
  }

  closeSpeedReader = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setTimeout(() => { Store.dispatch(stopSpeedReading()); }, 500);
  }

  componentDidMount() {
    this.controller = new SimpleReader(this.refs['speed-reader']);
    this.controller.setArticle({
      headline: this.props.article.headline,
      body: this.props.article.body
    });

    window.addEventListener('blur', this._pause);

    this.renderSpeedHTML();

    setTimeout(() => {
      this.setState({ speedReaderFadeIn: true, countdown: true, playing: true });
    }, 500);
  }

  componentWillUpdate(nextProps, nextState) {
    // don't do anything on the fade in state change
    if (nextState.speedReaderFadeIn && !this.state.speedReaderFadeIn) return;

    // State changes
    if (!nextState.countdown && this.state.countdown) this.playSpeedReader();

    if (!this.state.countdown) {
      if (nextState.playing && !this.state.playing) this.playSpeedReader();
      else if (!nextState.playing && this.state.playing) this.pauseSpeedReader();
    }
  }

  componentDidUpdate(lastProps, lastState) {
    if (this.state.countdown) {
      if (!this.state.playing) {
        if (this.countdownTimeout) clearTimeout(this.countdownTimeout);
        return;
      }

      if (this.state.countdownIndex === 1) {
        this.countdownTimeout = setTimeout(() => {
          this.setState({ countdown: false });
        }, 1000);
      } else if (this.state.countdownIndex === null) {
        this.setState({ countdownIndex: this.countdownTime });
      }
      else if (this.state.countdownIndex !== lastState.countdownIndex) {
        let newIndex = this.state.countdownIndex - 1;
        if (newIndex < 0) return;

        this.countdownTimeout = setTimeout(((countdownIndex) => {
          return () => {
            this.setState({ countdownIndex });
          }
        })(newIndex), 1000);
      }
    }
  }

  componentWillUnmount() { this.deinit(); }

  deinit = () => {
    this.controller.pause();
    if (this.countdownTimeout) {
      clearTimeout(this.countdownTimeout);
    }
    window.removeEventListener('blur', this._pause)
  }

  _pause = () => { this.setState({ playing: false }); }

  playSpeedReader = () => {
    if (!this.controller) return;
    this.controller.resume();
  }

  pauseSpeedReader = () => {
    if (!this.controller) return;
    this.controller.pause();
  }

  togglePlay = () => {
    if (this.state.countdown) {
      this.renderRemainingTime();
      this.setState({ playing: !this.state.playing, countdownIndex: null});
      return;
    }

    let playing = !this.state.playing;
    if (!playing) this.renderRemainingTime();
    this.setState({ playing });
  }

  nextPara = () => {
    if (!this.controller || this.state.playing) return;
    this.controller.moveToNextParagraph();
    this.renderRemainingTime();
    this.setState({});
  }

  prevPara = () => {
    if (!this.controller || this.state.playing) return;
    this.controller.moveToPreviousParagraph();
    this.renderRemainingTime();
    this.setState({});
  }

  updateSpeed = (speed) => {
    if (!this.controller) return;

    this.controller.setReadingSpeed(speed, 'slider');
    this.renderSpeedHTML();
    this.renderRemainingTime();
  }

  renderSpeedHTML = () => {
    let ref = this.refs['wpm'];
    if (!ref) return;

    ref.innerHTML = `${this.controller.readingSpeed} WPM`;
  }

  renderRemainingTime = () => {
    let ref = this.refs['time-remaining'];
    if (!ref) return;

    ref.innerHTML = `${this.controller.getRemainingTime()} remaining`;
  }

  renderCountdown() {
    if (!this.state.countdown) return;

    let word = '';
    switch(this.state.countdownIndex) {
      case 3:
        word = 'Ready?';
        break;
      case 2:
        word = 'Set...';
        break;
      default:
      case 1:
        word = 'Go!';
    }
    return (
      <div className='countdown-container'>
        <div className='countdown-content' key={ `countdown-${this.state.countdownIndex}` }>{ word }</div>
      </div>
    )
  }

  renderContext() {
    if (this.state.playing || !this.controller ||
        !this.controller.currentContext || !this.controller.currentContext.length) {
      return null;
    }

    let context = this.controller.currentContext;
    let contextEl = [];
    for (let i = 0; i < context.length; i++ ) {
      let contextClass = 'context-element';
      if (i === 1) {
        contextClass += ' current-word';
      }
        contextEl.push(<span className={ contextClass } key={ `context-element-${i}` }>{ context[i] + ' ' }</span>)
    }

    return (
      <div className='current-context' key={ context[1] }>
        { contextEl }
      </div>
    )
  }

  renderControls() {
    let controlClass = 'speed-controls';

    return(
      <div className={ controlClass }>
        <div className='para prev'><i onClick={ this.prevPara } className='fa fa-angle-left'></i></div>
        <div className='button-container'>
          <div className='button' onClick={ this.togglePlay }>
            <i className='fa fa-play'></i>
            <i className='fa fa-pause'></i>
          </div>
        </div>
        <div className='para next'><i onClick={ this.nextPara } className='fa fa-angle-right'></i></div>
      </div>
    )
  }

  renderSpeedControl() {
    if (this.state.playing || !this.controller) return null;

    let speedControl = <SpeedControl speed={ this.controller.readingSpeed } updateSpeed={ this.updateSpeed }/>;

    return (
      <div className='speed-control-container'>
        { speedControl }
      </div>
    )
  }

  render() {
    let speedReaderClass = 'speed-reader';
    if (this.state.speedReaderFadeIn) {
      speedReaderClass += ' fade-in';
    }

    let countdown = null;
    if (this.state.countdown && this.state.countdownIndex) {
      speedReaderClass += ` countdown countdown-${this.state.countdownIndex}`;
      countdown = this.renderCountdown();
    }

    if (!this.state.playing) speedReaderClass += ' paused';
    return (
      <div className={ speedReaderClass }>
        <div className='context'> { this.renderContext() }</div>
        <div className='speed-reader-content'>
          <div ref='speed-reader'></div>
          { countdown }
        </div>
        <div className='speed-reader-controls'>
          { this.renderControls() }
          <div className='wpm' ref='wpm'></div>
          <div className='time-remaining' ref='time-remaining'></div>
        </div>
        { this.renderSpeedControl() }
        <div className='controls'>
          <div className='control-container'>
            <div className='speed-button' onClick={ this.togglePlay }><span className='button-text'><img src='/img/rabbit-red.svg'/></span></div>
          </div>
          <div className='control-container'>
            <div className='close-button' onClick={ this.closeSpeedReader }><span className='button-text'>Close</span></div>
          </div>
        </div>
      </div>
    )
  }
}

class SpeedControl extends React.Component {
  static defaultProps = { speed: 200 }
  static maxSpeed = 1000;
  static speedStep = 25;
  constructor(props) {
    super(props);

    this.state = {
      drawBars: false
    }
  }

  componentDidMount() {
    this.parentNode = this.refs['speed-control'].parentNode;
    this.parentNode.scrollLeft = this.props.speed;
    this.parentNode.addEventListener('scroll', this.updateSpeed);
    this.setState({ drawBars: true });
  }

  componentWillUnmount() {
    this.parentNode.removeEventListener('scroll', this.updateSpeed);
  }

  updateSpeed = (e) => {

    // Don't allow 0 wpm
    if (!this.parentNode.scrollLeft) {
      e.preventDefault();
      e.stopPropagation;
      this.parentNode.scrollLeft = 1;
    }

    this.props.updateSpeed(this.parentNode.scrollLeft);
  }

  renderSteps() {
    let numSteps = SpeedControl.maxSpeed / SpeedControl.speedStep;
    let steps = [];
    for (let i = 0; i <= numSteps; i++) {
      let speedVal = i * SpeedControl.speedStep;
      let style = { left: `${speedVal + (window.innerWidth / 2)}px` }

      let textContent = null;
      if (!(speedVal % 50)) textContent = (<span className='speed-val'>{ speedVal }</span>)

      steps.push(<div className='speed-control-step' key={ `speed-control-step-${i}` } style={ style }>{ textContent }</div>);
    }
    return steps;
  }

  render() {
    let speedControlClass = 'speed-control';
    if (this.state.drawBars) speedControlClass += ' draw';

    let style = { width: `${SpeedControl.maxSpeed + window.innerWidth}px` }
    return (
      <div className={ speedControlClass } ref='speed-control' style={ style }>
        { this.renderSteps() }
        <div className='center-bar'><i className='fa fa-caret-down'></i></div>
      </div>
    )
  }
}
