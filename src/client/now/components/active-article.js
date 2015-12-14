'use strict';

import React from 'react';

import Dispatcher from '../../dispatcher';
import { ArticleActions } from '../../store/article-store';
import LoadingImage from './loading-image';
import ScrollHook from './scroll-hook';
import SpeedReader from './speed-reader';
import { toggleClass } from '../../lib/dom';

class ActiveArticle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photoLoaded: false,
      fadeImageOut: false,
      fadeInContent: false,
      fadeSpeedReader: false
    }

    this.scrollHooks = [new ScrollHook({
      ref: 'article-content',
      scrollTopThresholdDown: '10%',
      scrollTopThresholdUp: '30%',
      scrollDownHook: () => { this.setState({ fadeImageOut: true }) }.bind(this),
      scrollUpHook: () => { this.setState({ fadeImageOut: false }) }.bind(this),
    })];
  }

  componentWillMount() { this.loadPhoto(); }
  componentDidMount() { window.addEventListener('scroll',  this.checkScroll); }
  componentWillUnmount() { window.removeEventListener('scroll', this.checkScroll); }

  componentWillReceiveProps(nextProps) {
    if (nextProps.speedReading && !this.props.speedReading) {
      this.setState({ fadeSpeedReader: true });
    } else if (!nextProps.speedReading && this.props.speedReading) {
      this.setState({ fadeSpeedReader: true});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.fadeSpeedReader && !prevState.fadeSpeedReader) {
      setTimeout(() => {
        this.setState({ fadeSpeedReader: false });
      }, 500);
    }
  }

  /**
   * Used to check the scroll at intervals in order to ease animations
   */
  checkScroll = () => {
    let currentTop = window.scrollY;
    for (let hook of this.scrollHooks) {
      hook.storeClientTop(currentTop);
      if (hook.shouldTriggerHook()) {
        hook.triggerHook();
      }
    }
  }

  photoLoaded = () => {
    setTimeout(() => {
      this.setState({ photoLoaded: true });
    }, 500);

    setTimeout(() => {
      this.setState({ fadeInContent: true });
    }, 1000);
  }

  loadPhoto() {
    let article = this.props.article;
    if (!article.photo) {
      this.photoLoaded();
      return;
    }

    let i = new Image();

    i.onload = () => { this.photoLoaded(); }
    i.src = article.photo.full.url;
  }

  loadSpeedReader() {
    Dispatcher.dispatch({
      type: ArticleActions.startSpeedReading
    })
  }

  closeActiveArticle(e) {
    Dispatcher.dispatch({
      type: ArticleActions.closeActiveArticle
    });
  }


  getBackgroundStyle() {
    let article = this.props.article;
    let style = {}

    if (this.state.photoLoaded && !!article.photo) {
      style.backgroundImage = `url(${article.photo.full.url})`;
    }
    return style;
  }

  // Speed reader button changes locations based on scroll height
  renderSummarySentence = (sentence, index) => {
    return (
      <div className='summary-sentence' key={ `summary-${index}` }>
        <div className='summary-index'>{ index + 1 }</div>
        <div className='sentence'>{ sentence }</div>
      </div>
    )
  }

  render() {
    let activeArticleContainerClass = 'active-article-container';
    if (this.state.photoLoaded) activeArticleContainerClass += ' photo-loaded';

    if (this.state.fadeSpeedReader) {
      activeArticleContainerClass += ' fade-in-speed-reader';
    }
    else if (this.props.speedReading) activeArticleContainerClass += ' speed-reading';

    let article = this.props.article;
    let activeArticleClass = 'active-article';
    let articleContentClass = 'article-content';
    if (this.state.fadeImageOut) {
      activeArticleClass += ' fade-out';
      articleContentClass += ' fade-in';
    }
    if (this.state.fadeInContent) {
      articleContentClass += ' fade-in';
    }

    let speedReaderContainerClass = 'speed-reader-container';
    let speedReader = null;
    if (this.props.speedReading) {
      speedReaderContainerClass += ' active';
      speedReader = <SpeedReader article={ article } key={ `speed-reader-${article.article_id}` }/>
    }


    return (
      <div className={ activeArticleContainerClass } >
        <div className={ activeArticleClass } ref='active-article'>
          <div className='article-image' style={ this.getBackgroundStyle() }></div>
          <div className='article-content-container' ref='article-content-container'>
            <div className={ articleContentClass } ref='article-content'>
              <div className='title'>{ article.headline }</div>
              <div className='subtitle-container'>
                <div className='readers'>{ `Current Readers: ${this.props.readers}` }</div>
              </div>
              <div className='summary-container'>
                { article.summary.map(this.renderSummarySentence) }
              </div>
              <div className='article-controls'>
                <div className='control-container start-speed-reader'>
                  <div className='control' onClick={ this.loadSpeedReader.bind(this) }><span className='control-text'>Speed Read</span></div>
                </div>
                <div className='control-container close-article'>
                  <div className='control' onClick={ this.closeActiveArticle.bind(this) }><span className='control-text'>Close</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={ speedReaderContainerClass }>
          { speedReader }
        </div>
      </div>
    )
  }
}

module.exports = ActiveArticle
