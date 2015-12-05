'use strict';

import React from 'react';
import { SimpleReader } from 'reeeeeader';

import Dispatcher from '../../dispatcher';
import { ArticleActions } from '../../store/article-store';

export default class SpeedReader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      speedReaderFadeIn: false,
      playing: true,
      countdown: false,
      countdownIndex: 3
    }

    this.countdownTime = 3;
    this.controller = null;
    this.countdownTimeout;
  }

  closeSpeedReader = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (this.controller) this.controller.pause();
    this.setState({ speedReaderFadeIn: false });
    this.deinit();

    setTimeout(() => {
      Dispatcher.dispatch({
        type: ArticleActions.stopSpeedReading
      });
    }, 500);
  }

  componentDidMount() {
    this.controller = new SimpleReader(this.refs['speed-reader']);
    this.controller.setArticle({
      headline: this.props.article.headline,
      body: this.props.article.body
    });

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

  componentDidUpdate() {
    if (this.state.countdown) {
      if (!this.state.playing) {
        if (this.countdownTime) clearTimeout(this.countdownTimeout);
        return;
      }

      if (this.state.countdownIndex === 0) {
        this.countdownTimeout = setTimeout(() => {
          this.setState({ countdown: false });
        }, 1000);
      }
      else {
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

  componentWillUnmount = () => { this.deinit(); }

  deinit() {
    this.controller.pause();
    if (this.countdownTimeout) clearTimeout(this.countdownTimeout);
  }

  playSpeedReader() {
    if (!this.controller) return;
    this.controller.resume();
  }

  pauseSpeedReader() {
    if (!this.controller) return;
    this.controller.pause();
  }

  togglePlay = () => {
    if (this.state.countdown) {
      this.setState({ playing: !this.state.playing, countdownIndex: this.countdownTime});
      return;
    }

    let playing = !this.state.playing;
    this.setState({ playing });
  }

  nextPara = () => {
    if (!this.controller || this.state.playing) return;
    this.controller.moveToNextParagraph();
    this.setState({});
  }

  prevPara = () => {
    if (!this.controller || this.state.playing) return;
    this.controller.moveToPreviousParagraph();
    this.setState({});
  }

  updateSpeed = (speed) => {
    if (!this.controller) return;

    this.controller.setReadingSpeed(speed, 'slider');
    this.renderSpeedHTML();
  }

  renderSpeedHTML = () => {
    let ref = this.refs['wpm'];
    if (!ref) return;

    ref.innerHTML = `${this.controller.readingSpeed} WPM`;
  }

  renderCountdown() {
    if (!this.state.countdown) return;
    return (
      <div className='countdown-container'>
        <div className='countdown-number' key={ `countdown-${this.state.countdownIndex}` }>{ this.state.countdownIndex }</div>
      </div>
    )
  }

  renderContext() {
    if (this.state.playing || !this.controller || !this.controller.currentContext.length) return null;

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
    let controlClass = 'controls';

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
    let speedControl = null;
    if (!this.state.playing && !!this.controller) {
      speedControl = <SpeedControl speed={ this.controller.readingSpeed } updateSpeed={ this.updateSpeed }/>;
    }

    return (
      <div className='speed-control-container'>
        { speedControl }
      </div>
    )
  }

  renderWPM() {
    return (
      <div className='wpm' ref='wpm'></div>
    )
  }

  render() {
    let speedReaderClass = 'speed-reader';
    if (this.state.speedReaderFadeIn) {
      speedReaderClass += ' fade-in';
    }

    if (!this.state.playing) speedReaderClass += ' paused';
    return (
      <div className={ speedReaderClass }>
        <div className='context'> { this.renderContext() }</div>
        <div ref='speed-reader'></div>
        <div className='speed-reader-controls'>
          { this.renderControls() }
          { this.renderWPM() }
        </div>
        { this.renderCountdown() }
        { this.renderSpeedControl() }
        <div className='close-button' onClick={ this.closeSpeedReader }>
          Close
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

  updateSpeed = () => {
    let speed = this.parentNode.scrollLeft;
    this.props.updateSpeed(speed);
  }

  renderSteps() {
    let numSteps = SpeedControl.maxSpeed / SpeedControl.speedStep;
    let steps = [];
    for (let i = 0; i < numSteps; i++) {
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
