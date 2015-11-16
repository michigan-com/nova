'use strict';

import React from 'react';
import Dispatcher from '../dispatcher';
import { ArticleActions } from '../store/article-store';

// React Component representing article in the articles array from Chartbeat
// toppages snapshot
//
// https://api.michigan.com/v1/snapshot/toppages/ -> articles[n]
class TopArticle extends React.Component {
  // TODO make this responsive? Move this functionality into CSS?
  // height: 100px, padding 10px
  static defaultStyle = { height: 100, margin: 10 }
  setActiveArticle(e) {
    e.preventDefault();
    e.stopPropagation();
    Dispatcher.dispatch({
      type: ArticleActions.articleSelected,
      article_id: this.props.article.article_id,
      readers: this.props.article.readers
    });
  }


  getStyle = () => {
    return {
      top: `${(this.props.rank * TopArticle.defaultStyle.height) + TopArticle.defaultStyle.margin}px`
    }
  }

  render() {
    // TODO figure out best way to animate this
    let article = this.props.article;
    let readers = article.visits;
    let headline = article.headline;

    return (
      <div className='top-article-container' style={ this.getStyle() }>
        <div className={ `top-article${this.props.clicked ? 'clicked' : ''}` }  onClick={ this.setActiveArticle.bind(this) }>
          <div className='readers'>{ readers }</div>
          <div className='headline'>{ headline }</div>
        </div>
      </div>
    )
  }
}

module.exports = TopArticle;
