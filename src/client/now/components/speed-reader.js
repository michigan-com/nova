'use strict';

import React from 'react';
import { SimpleReader } from 'reeeeeader';

import Store from '../../store';
import { startSpeedReading, stopSpeedReading } from '../../actions/active-article';
import { brandIcon } from '../../../../config';

export default class SpeedReader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      gotStarted: false,
      playing: false,
      speedReaderFinished: false,
      countdown: true,
      countdownIndex: null,
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
    console.log('speed-reader-mount');
    this.initSpeedReader();
    window.addEventListener('blur', this._pause);
  }

  initSpeedReader() {
    this.controller = new SimpleReader(this.refs['speed-reader-text'], {
      onComplete: () => {
        setTimeout( () => {
          this.setState({ speedReaderFinished: true, playing: false });
        }.bind(this), 250);
      }
    });
    this.controller.setArticle({
      headline: this.props.article.headline,
      body: this.props.article.body
    });

    this.renderRemainingTime();
  }

  componentWillUpdate(nextProps, nextState) {
    // State changes
    if (!nextState.countdown && this.state.countdown) this.playSpeedReader();

    if (!this.state.countdown) {
      if (nextState.playing && !this.state.playing) this.playSpeedReader();
      else if (!nextState.playing && this.state.playing) this.pauseSpeedReader();
    }

    if (nextState.speedReaderFinished && !this.state.speedReaderFinished) {
      this.refs['speed-reader-text'].innerHTML = '';
      Store.dispatch(stopSpeedReading());
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

  scrollIntoView(lastScrollTop=null, autoplay=false) {
    let body = document.body;
    let currentScrollTop = body.scrollTop;

    // this means the user is trying to scroll up, so just let them already
    // if (currentScrollTop < lastScrollTop) return;

    let scrollTopGoal = document.body.clientHeight - window.innerHeight;
    let remaining = scrollTopGoal - currentScrollTop;
    let step = 15;
    step = remaining < step ? remaining : step;

    if (step === 0) {
      if (!autoplay) return;

      let state = { playing: true };
      if (!this.state.gotStarted) {
        state.gotStarted = true;
        state.countdown = true;
      }

      setTimeout(() => {
        this.setState(state);
      }.bind(this), 650);
      return
    }

    let newScrollTop = body.scrollTop + step;
    body.scrollTop = newScrollTop;
    setTimeout(((newScrollTop) => {
      return () => {
        this.scrollIntoView(newScrollTop, autoplay);
      }.bind(this)
    })(newScrollTop), 10);
  }

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

    let article = this.props.article;
    Store.dispatch(startSpeedReading(article.article_id));

    this.controller.resume();
  }

  pauseSpeedReader = () => {
    if (!this.controller) return;

    let article = this.props.article;
    Store.dispatch(stopSpeedReading(article.article_id));

    this.controller.pause();
  }

  togglePlay = () => {
    if (!this.state.gotStarted) {
      this.scrollIntoView(document.body.scrollTop, true);
      return;
    }

    if (this.state.countdown) {
      this.renderRemainingTime();
      this.setState({ playing: !this.state.playing, countdownIndex: null});
      return;
    }

    if (this.state.speedReaderFinished) {
      this.initSpeedReader();
    }


    let playing = !this.state.playing;
    if (!playing) this.renderRemainingTime();
    this.setState({ playing, speedReaderFinished: false });
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
    this.renderWPM();
    this.renderRemainingTime();
  }

  renderWPM = () => {
    let ref = this.refs['wpm'];
    if (!ref) return;

    ref.innerHTML = `${this.controller.readingSpeed} WPM`;
  }

  renderRemainingTime = () => {
    let ref = null;
    let remainingTime = this.controller.getRemainingTime();
    let remainingTimeSplit = remainingTime.split(':');
    let minutes = parseInt(remainingTimeSplit[0]);
    let seconds = parseInt(remainingTimeSplit[1]);

    // Total time
    ref = this.refs['total-time']
    if (!ref) return;
    if (!minutes) {
      ref.innerHTML = `under 1 minute`;
    }
    else {
      let approxMin = minutes;
      if (seconds >= 30) approxMin += 1;
      ref.innerHTML = `${approxMin} minute${approxMin > 1 ? 's': ''}`;
    }

    // Remaining time
    ref = this.refs['time-remaining'];
    if (!ref) return;
    ref.innerHTML = `${minutes}:${seconds} remaining`;
  }

  renderCountdown() {
    if (!this.state.gotStarted) {
      return (
        <div className='countdown-container'>
          <div className='get-started'>Click Play to get started</div>
        </div>
      )
    }

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
        !this.controller.currentContext || !this.controller.currentContext.length ||
       !this.state.gotStarted) {
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
    if (!this.state.gotStarted) controlClass += ' not-started';

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
    //if (this.state.playing || !this.controller || !this.state.gotStarted) return null;
    if (!this.controller) return null;

    let speedControl = <SpeedControl speed={ this.controller.readingSpeed } updateSpeed={ this.updateSpeed }/>;

    return (
      <div className='speed'>
        <div className='center-bar'><i className='fa fa-caret-down'></i></div>
        { speedControl }
      </div>
    )
  }

  render() {
    let speedReaderClass = 'speed-reader';
    if (!this.state.gotStarted) speedReaderClass += ' not-started';

    let countdown = null;
    if (this.state.countdown && this.state.countdownIndex) {
      speedReaderClass += ` countdown countdown-${this.state.countdownIndex}`;
      countdown = this.renderCountdown();
    }

    let helpText = null;
    if (!this.state.gotStarted) helpText = <div className='help-text'>Adjust your speed, then press Play to get started </div>
    else if (this.state.speedReaderFinished) helpText = <div className='help-text'>All done!</div>

    if (!this.state.playing) speedReaderClass += ' paused';
    return (
      <div className='speed-reader-container'>
        <div className='keep-scrolling'>
          <img className='speed-rabbit' src={ `/img/${brandIcon}/speed-reader-image.svg` }/>
          <div className='text-box'>Keep scrolling to speed read this article in <span ref='total-time'></span></div>
          <div className='arrow-container'>
            <img src='/img/chevron-down-white.svg' onClick={ () => { this.scrollIntoView(document.body.scrollTop) }.bind(this) }/>
          </div>
        </div>
        <div className={ speedReaderClass } ref='speed-reader'>
          { helpText }
          <div className='context'> { this.renderContext() }</div>
          <div className='speed-reader-content'>
            <div ref='speed-reader-text'></div>
            { countdown }
          </div>
          <div className='speed-reader-controls'>
            { this.renderControls() }
            <div className='wpm' ref='wpm'></div>
            <div className='time-remaining' ref='time-remaining'></div>
          </div>
          { this.renderSpeedControl() }
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
      <div className='speed-control-container'>
        <div className={ speedControlClass } ref='speed-control' style={ style }>
          { this.renderSteps() }
        </div>
      </div>
    )
  }
}
