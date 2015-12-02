'use strict';

import React from 'react';
import { ReadingPopupController } from 'reeeeeader';

import Dispatcher from '../../dispatcher';
import { ArticleActions } from '../../store/article-store';
import LoadingImage from './loading-image';
import ScrollHook from './scroll-hook';
import { toggleClass } from '../../lib/dom';

class ActiveArticle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photoLoaded: false,
      fadeImageOut: false,
      speedReaderBottom: false
    }

    this.scrollHooks = [new ScrollHook({
      ref: 'article-content',
      scrollTopThreshold: '10%',
      scrollDownHook: () => { this.setState({ fadeImageOut: true }) }.bind(this),
      scrollUpHook: () => { this.setState({ fadeImageOut: false }) }.bind(this),
    }), new ScrollHook({
      ref: 'article-content',
      scrollTopThreshold: '90%',
      scrollDownHook: () => { this.setState({ speedReaderBottom: true }) }.bind(this),
      scrollUpHook: () => { this.setState({ speedReaderBottom: false }) }.bind(this)
    })];
  }

  componentWillMount() { this.loadPhoto(); }
  componentDidMount() { window.addEventListener('scroll',  this.checkScroll); }
  componentWillUnmount() { window.removeEventListener('scroll', this.checkScroll); }

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
    let controller = new ReadingPopupController();
    controller.setArticle({
      headline: this.props.article.headline,
      body: this.props.article.body
    });
  }

  clickActiveArticle(e) {
    if (/start-speed-reader|fa-forward/.test(e.target.className)) {
      this.loadSpeedReader();
      return;
    } else if (!(/(close-article|active-article-container)/.test(e.target.className))) {
      return;
    } else {
      Dispatcher.dispatch({
        type: ArticleActions.closeActiveArticle
      });
    }
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
  renderSpeedReaderStart(location) {
    let startSpeedReaderClass = 'start-speed-reader';
    let startSpeedReaderContainerClass = 'start-speed-reader-container';

    switch (location) {
      case 'subtitle':
        if (this.state.fadeImageOut) {
          startSpeedReaderClass += ' shrink';
        }
        break;
      case 'bottom':
        startSpeedReaderClass += ' shrink';
        if (this.state.speedReaderBottom) {
          startSpeedReaderClass = 'start-speed-reader';
        }
        break;
    }
    return (
      <div className={ startSpeedReaderContainerClass }>
          <div className={ startSpeedReaderClass }>Speed Read</div>
      </div>
    )
  }

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
    if (this.state.photoLoaded) activeArticleContainerClass += ' loaded';

    let article = this.props.article;
    let activeArticleClass = 'active-article';
    let articleContentClass = 'article-content';
    if (this.state.fadeImageOut) {
      activeArticleClass += ' fade-out';
      articleContentClass += ' fade-in';
    }

    return (
      <div className={ activeArticleContainerClass } onClick={ this.clickActiveArticle.bind(this) }>
        <div className={ activeArticleClass } ref='active-article'>
          <div className='article-image' style={ this.getBackgroundStyle() }></div>
          <div className='article-content-container' ref='article-content-container'>
            <div className={ articleContentClass } ref='article-content'>
              <div className='title'>{ article.headline }</div>
              <div className='subtitle-container'>
                <div className='readers'>{ `Current Readers: ${this.props.readers}` }</div>
                { this.renderSpeedReaderStart('subtitle') }
              </div>
              <div className='summary-container'>
                { article.summary.map(this.renderSummarySentence) }
              </div>
              <div className='article-controls'>
                { this.renderSpeedReaderStart('bottom') }
                <div className='close-article'>Close</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = ActiveArticle
