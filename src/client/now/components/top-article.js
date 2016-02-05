 'use strict';

import React from 'react';

import Store from '../../store';
import { articleSelected } from '../../actions/active-article';

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
    let article = this.props.article;
    Store.dispatch(articleSelected(article.article_id, article.visits));
  }

  articleClicked = (e) => {
    this.setState({ articleClicked: true });

    // TODO this should maybe be handled by the store, so we're not waiting
    // on the animation and THEN the fetching of the data in sequence
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
