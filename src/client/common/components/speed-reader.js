'use strict';

import React from 'react';
import { SimpleReader } from 'reeeeeader';

import SpeedControl from './speed-control';
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
      wordUpdate: 0,
    };

    this.countdownTime = 3;
    this.controller = null;
    this.countdownTimeout = undefined;

    this.scrollIntoView = this.scrollIntoView.bind(this);
  }

  componentDidMount() {
    this.initSpeedReader();
    window.addEventListener('blur', this.pause);
  }

  shouldComponentUpdate(nextProps, nextState) {
    // Hacky....
    // Don't update the speed reader unnecessarily
    if (JSON.stringify(this.state) === JSON.stringify(nextState) &&
        JSON.stringify(this.props) === JSON.stringify(nextProps)) {
      return false;
    }

    return true;
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
    }

    if (nextState.countdown) {
      if (!nextState.playing) {
        if (this.countdownTimeout) clearTimeout(this.countdownTimeout);
        return;
      }

      if (nextState.countdownIndex === 1) {
        this.countdownTimeout = setTimeout(() => {
          this.setState({ countdown: false });
        }, 1000);
      } else if (nextState.countdownIndex === null) {
        this.setState({ countdownIndex: this.countdownTime });
      } else if (nextState.countdownIndex !== this.state.countdownIndex) {
        const newIndex = nextState.countdownIndex - 1;
        if (newIndex < 0) return;

        this.countdownTimeout = setTimeout(((countdownIndex) => (
          () => {
            this.setState({ countdownIndex });
          }
        ))(newIndex), 1000);
      }
    }
  }

  componentWillUnmount() { this.deinit(); }

  initSpeedReader() {
    this.controller = new SimpleReader(this.refs['speed-reader-text'], {
      onComplete: () => {
        setTimeout(() => {
          this.setState({ speedReaderFinished: true, playing: false });
          this.renderRemainingTime();
        }, 250);
      },
      onNewWord: () => {
        const wordUpdate = this.state.wordUpdate + 1;
        this.setState({ wordUpdate });
      },
    });
    this.controller.setArticle({
      headline: this.props.article.headline,
      body: this.props.article.body,
    });
    this.renderRemainingTime();
  }

  scrollIntoView(lastScrollTop = null, autoplay = false) {
    const body = document.body;
    const currentScrollTop = body.scrollTop;

    // this means the user is trying to scroll up, so just let them already
    if (currentScrollTop < lastScrollTop - 15) return;

    const scrollTopGoal = document.body.clientHeight - window.innerHeight;
    const remaining = scrollTopGoal - currentScrollTop;
    let step = 15;
    step = remaining < step ? remaining : step;

    if (step === 0) {
      if (!autoplay) return;

      const state = { playing: true };
      if (!this.state.gotStarted) {
        state.gotStarted = true;
        state.countdown = true;
      }

      setTimeout(() => {
        this.setState(state);
      }, 650);
      return;
    }

    const newScrollTop = body.scrollTop + step;
    body.scrollTop = newScrollTop;
    setTimeout(() => {
      this.scrollIntoView(newScrollTop, autoplay);
    }, 10);
  }

  deinit = () => {
    this.controller.pause();
    if (this.countdownTimeout) {
      clearTimeout(this.countdownTimeout);
    }
    window.removeEventListener('blur', this.pause);
  }

  pause = () => { this.setState({ playing: false }); }

  playSpeedReader = () => {
    if (!this.controller) return;

    const article = this.props.article;
    this.props.startSpeedReading(article.article_id);

    this.controller.resume();
  }

  pauseSpeedReader = () => {
    if (!this.controller) return;

    const article = this.props.article;
    this.props.stopSpeedReading(article.article_id);

    this.controller.pause();
  }

  togglePlay = () => {
    if (!this.state.gotStarted) {
      this.scrollIntoView(document.body.scrollTop, true);
      return;
    }

    if (this.state.countdown) {
      this.renderRemainingTime();
      this.setState({ playing: !this.state.playing, countdownIndex: null });
      return;
    }

    if (this.state.speedReaderFinished) {
      this.initSpeedReader();
    }


    const playing = !this.state.playing;
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
    const ref = this.refs.wpm;
    if (!ref) return;

    ref.innerHTML = `${this.controller.readingSpeed} WPM`;
  }

  renderRemainingTime = () => {
    let ref = null;
    const remainingTime = this.controller.getRemainingTime();
    const remainingTimeSplit = remainingTime.split(':');
    const minutes = parseInt(remainingTimeSplit[0], 10);
    const seconds = parseInt(remainingTimeSplit[1], 10);

    // Total time
    ref = this.refs['total-time'];
    if (!ref) return;
    if (!minutes) {
      ref.innerHTML = 'under 1 minute';
    } else {
      let approxMin = minutes;
      if (seconds >= 30) approxMin += 1;
      ref.innerHTML = `${approxMin} minute${approxMin > 1 ? 's' : ''}`;
    }

    // Remaining time
    ref = this.refs['time-remaining'];
    if (!ref) return;
    ref.innerHTML = `${minutes}:${seconds >= 10 ? seconds : `0${seconds}`} remaining`;
  }

  renderCountdown() {
    if (!this.state.gotStarted) {
      return (
        <div className="countdown-container">
          <div className="get-started">Click Play to get started</div>
        </div>
      );
    }

    if (!this.state.countdown) return null;

    let word = '';
    switch (this.state.countdownIndex) {
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
      <div className="countdown-container">
        <div
          className="countdown-content"
          key={`countdown-${this.state.countdownIndex}`}
        >
          {word}
        </div>
      </div>
    );
  }

  renderContext() {
    if (this.state.playing || !this.controller ||
        !this.controller.currentContext || !this.controller.currentContext.length ||
       !this.state.gotStarted) {
      return null;
    }

    const context = this.controller.currentContext;
    let contextEl = [];
    for (let i = 0; i < context.length; i++) {
      let contextClass = 'context-element';
      if (i === 1) {
        contextClass += ' current-word';
      }
      contextEl.push(
        <span className={contextClass} key={`context-element-${i}`}>{`${context[i]} `}</span>
      );
    }

    return (
      <div className="current-context" key={context[1]}>
        {contextEl}
      </div>
    );
  }

  renderControls() {
    let controlClass = 'speed-controls';
    if (!this.state.gotStarted) controlClass += ' not-started';

    const buttonHeight = 50;
    let buttonStyle = { height: buttonHeight, width: buttonHeight };

    return (
      <div className={controlClass}>
        <div className="controls-container">
          <div className="para prev">
            <i onClick={this.prevPara} className="fa fa-angle-left"></i>
          </div>
          <div className="button-container">
            <div className="button" onClick={this.togglePlay} style={buttonStyle}>
              <i className="fa fa-play"></i>
              <i className="fa fa-pause"></i>
            </div>
          </div>
          <div className="para next">
            <i onClick={this.nextPara} className="fa fa-angle-right"></i>
          </div>
        </div>
      </div>
    );
  }

  renderSpeedControl() {
    // if (this.state.playing || !this.controller || !this.state.gotStarted) return null;
    if (!this.controller) return null;

    let speedControl = (
      <SpeedControl
        speed={this.controller.readingSpeed}
        updateSpeed={this.updateSpeed}
      />
    );

    return (
      <div className="speed">
        <div className="center-bar"><i className="fa fa-caret-down"></i></div>
        {speedControl}
      </div>
    );
  }

  renderProgressCircle() {
    let remainingPercent = 100;
    if (this.controller !== null) remainingPercent = this.controller.getRemainingPercentage();
    let circleHeight = 250;
    let radius = circleHeight / 2;
    const strokeDasharray = Math.PI * (circleHeight * 2);
    const circumference = strokeDasharray;
    const strokeDashoffset = strokeDasharray - ((remainingPercent / 200) * circumference);

    let progressStyle = { strokeDashoffset, strokeDasharray };
    let progressContainerStyle = { height: circleHeight, top: (circleHeight / -4) };

    return (
      <div className="progress-container" style={progressContainerStyle}>
        <svg className="progress" height={circleHeight} width={circleHeight} xmlns="http://www.w3.org/2000/svg">
          <circle
            r={radius}
            cx={radius}
            cy={radius}
            fill="transparent"
            className="progress-circle"
            style={progressStyle}
          ></circle>
        </svg>
      </div>
    );
  }

  render() {
    let speedReaderClass = 'speed-reader';
    if (!this.state.gotStarted) speedReaderClass += ' not-started';

    let countdown = null;
    if (this.state.countdown && this.state.countdownIndex) {
      speedReaderClass += ` countdown countdown-${this.state.countdownIndex}`;
      countdown = this.renderCountdown();
    }

    let speedReaderTextClass = 'speed-reader-text';
    if (this.state.speedReaderFinished) speedReaderTextClass += ' hide';

    let helpText = null;
    if (!this.state.gotStarted) {
      helpText = (
        <div className="help-text">Adjust your speed, then press Play to get started </div>
      );
    } else if (this.state.speedReaderFinished) {
      helpText = (
        <div className="help-text">All done
          <div className="done-image">
            <img src={`/img/${brandIcon}/speed-reader-image.svg`} alt="Brand Icon" />
          </div>
        </div>
      );
    }

    if (!this.state.playing) speedReaderClass += ' paused';
    return (
      <div className="speed-reader-container">
        <div className="keep-scrolling">
          <img
            className="speed-rabbit"
            src={`/img/${brandIcon}/speed-reader-image.svg`}
            alt="Bunny"
          />
          <div className="text-box">
            Keep scrolling to speed read this article in <span ref="total-time"></span>
          </div>
          <div className="arrow-container">
            <img
              src="/img/chevron-down-white.svg"
              onClick={(() => { this.scrollIntoView(document.body.scrollTop); })}
              alt="Keep Scrolling"
            />
          </div>
        </div>
        <div className={speedReaderClass} ref="speed-reader">
          {helpText}
          <div className="context"> {this.renderContext()}</div>
          <div className="speed-reader-content">
            {this.renderProgressCircle()}
            <div
              className={speedReaderTextClass}
              id="speed-reader-text"
              ref="speed-reader-text"
            ></div>
            {countdown}
          </div>
          <div className="speed-reader-controls">
            <div className="time-remaining" ref="time-remaining"></div>
            {this.renderControls()}
            <div className="wpm" ref="wpm"></div>
          </div>
        </div>
        {this.renderSpeedControl()}
      </div>
    );
  }
}


SpeedReader.propTypes = {
  article: React.PropTypes.object.isRequired,
  startSpeedReading: React.PropTypes.func,
  stopSpeedReading: React.PropTypes.func,
};

SpeedReader.defaultProps = {
  article: null,
  startSpeedReading: () => {},
  stopSpeedReading: () => {},
};
