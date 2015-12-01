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
      fadeImageOut: false
    }

    this.scrollHooks = [new ScrollHook({
      ref: 'article-content',
      scrollTopThreshold: '10%',
      scrollDownHook: () => { this.setState({ fadeImageOut: true }) }.bind(this),
      scrollUpHook: () => { this.setState({ fadeImageOut: false }) }.bind(this),
    })];
  }

  componentWillMount() { this.loadPhoto(); }

  /**
   * Used to check the scroll at intervals in order to ease animations
   */
  checkScroll = (articleNode) => {
    let currentTop = articleNode.scrollTop;
    for (let hook of this.scrollHooks) {
      hook.storeClientTop(currentTop);
      if (hook.shouldTriggerHook()) {
        hook.triggerHook();
      }
    }
  }

  loadPhoto() {
    let article = this.props.article;
    if (!article.photo) {
      this.setState({ photoLoaded: true });
      return;
    }

    let i = new Image();

    i.onload = () => { this.setState({ photoLoaded: true }) }
    i.src = article.photo.full.url;
  }

  loadSpeedReader() {
    let controller = new ReadingPopupController();
    controller.setArticle({
      headline: this.props.article.headline,
      body: this.props.article.body
    });
  }

  closeActiveArticle(e) {
    if (/start-speed-reader/.test(e.target.className)) {
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


  getStyle() {
    let article = this.props.article;
    let style = {}
    if (!article.photo || !this.state.photoLoaded) return style;

    style.backgroundImage = `url(${article.photo.full.url})`;
    return style;
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
    if (!this.state.photoLoaded) {
      return (
        <div className='active-article-container loading'>
          <LoadingImage blurbs={ ['Loading article...'] }/>
        </div>
      )
    }

    let article = this.props.article;
    let activeArticleClass = 'active-article';
    let articleContentClass = 'article-content';
    if (this.state.fadeImageOut) {
      activeArticleClass += ' fade-out';
      articleContentClass += ' fade-in';
    }

    return (
      <div className='active-article-container' onClick={ this.closeActiveArticle.bind(this) }>
        <div className={ activeArticleClass } style={ this.getStyle() } ref={ (ref) => { if (ref) ref.onscroll = this.checkScroll.bind(this, ref); } }>
          <div className='article-content-container' ref='article-content-container'>
            <div className={ articleContentClass } ref='article-content'>
              <div className='title'>{ article.headline }</div>
              <div className='readers'>{ `Current Readers: ${this.props.readers}` }</div>
              <div className='summary-container'>
                { article.summary.map(this.renderSummarySentence) }
              </div>
              <div className='article-controls'>
                <div className='control start-speed-reader'>Speed Read</div>
                <div className='control close-article'>Close</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

module.exports = ActiveArticle
