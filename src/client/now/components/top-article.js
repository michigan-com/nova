 'use strict';

import React from 'react';
import Dispatcher from '../../dispatcher';
import { ArticleActions } from '../../store/article-store';

// React Component representing article in the articles array from Chartbeat
// toppages snapshot
//
// https://api.michigan.com/v1/snapshot/toppages/ -> articles[n]
class TopArticle extends React.Component {
  // TODO make this responsive? Move this functionality into CSS?
  // height: 100px, padding 10px
  static defaultStyle = { height: 100, margin: 10 }
  static getHeight = () => {
    let height = TopArticle.defaultStyle.height;
    if (window.innerWidth <= 992) height *= .7; // 60 px
    return height;
  }

  constructor(props) {
    super(props);

    this.state = {
      articleClicked: false,
    }
  }

  setSelfAsActive = () => {
    Dispatcher.dispatch({
      type: ArticleActions.articleSelected,
      article_id: this.props.article.article_id,
      readers: this.props.article.visits
    });
  }

  articleClicked = (e) => {
    this.setState({ articleClicked: true });

    // TODO figure out a good way to set this in css and JS at the same time...
    setTimeout(() => {
      this.setSelfAsActive();
    }.bind(this), 750)
  }

  getStyle = () => {
    let style = {}
    let height = TopArticle.getHeight();
    let margin = TopArticle.defaultStyle.margin;
    style.top = `${(this.props.rank * (height + margin)) + margin}px`;
    return style;
  }

  render() {
    // TODO figure out best way to animate this
    let article = this.props.article;
    let readers = article.visits;
    let headline = article.headline;

    let style = {};
    style.animationDelay = `${this.props.rank * 50}ms`;

    let topArticleContainerClass = 'top-article-container';
    if (this.state.articleClicked) {
      topArticleContainerClass += ' clicked';
    }

    let topArticleClass = 'top-article';
    if (this.props.clicked) {
      topArticleClass += ' clicked';
    }

    let containerStyle = this.getStyle();
    return (
      <div className={ topArticleContainerClass } style={ containerStyle } id={ `top-article-container-${this.props.rank}-${this.props.windowSize}` }>
        <div className={ topArticleClass }  onClick={ this.articleClicked.bind(this) } style={ style }>
          <div className='readers-container'><div className='readers'>{ readers }</div></div>
          <div className='headline'>{ headline }</div>
        </div>
      </div>
    )
  }
}

module.exports = TopArticle;
