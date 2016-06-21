'use strict';

import React from 'react';

import Store from '../store';
import { articleSelected } from '../../common/actions/active-article';

export const TOP_ARTICLE_STYLE = {
  height: 100,
  margin: 10,
};

export function getTopArticleHeight() {
  let height = TOP_ARTICLE_STYLE.height;
  if (window.innerWidth <= 992) height *= 0.7; // 70px
  return height;
}

export function getTopArticleStyle(rank) {
  const style = {
    height: getTopArticleHeight(),
    marginBottom: TOP_ARTICLE_STYLE.margin,
  };
  style.top = `${(rank * (style.height + style.marginBottom)) + style.marginBottom}px`;
  return style;
}

// React Component representing article in the articles array from Chartbeat
// toppages snapshot
//
// https://api.michigan.com/v1/snapshot/toppages/ -> articles[n]
export default class TopArticle extends React.Component {
  // TODO make this responsive? Move this functionality into CSS?
  // height: 100px, padding 10px

  constructor(props) {
    super(props);

    this.state = {
      articleClicked: false,
    };

    this.articleClicked = this.articleClicked.bind(this);
    this.setSelfAsActive = this.setSelfAsActive.bind(this);
  }

  setSelfAsActive = () => {
    const article = this.props.article;
    Store.dispatch(articleSelected(article.article_id, article.visits));
  }

  articleClicked = () => {
    this.setState({ articleClicked: true });

    // TODO this should maybe be handled by the store, so we're not waiting
    // on the animation and THEN the fetching of the data in sequence
    setTimeout(() => {
      this.setSelfAsActive();
    }, 750);
  }

  render() {
    // TODO figure out best way to animate this
    const article = this.props.article;
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

    let containerStyle = getTopArticleStyle(this.props.rank);
    return (
      <div
        className={topArticleContainerClass}
        style={containerStyle}
        id={`top-article-container-${this.props.rank}-${this.props.windowSize}`}
      >
        <div className={topArticleClass} onClick={this.articleClicked} style={style}>
          <div className="readers-container"><div className="readers">{readers}</div></div>
          <div className="headline">{headline}</div>
        </div>
      </div>
    );
  }
}

TopArticle.propTypes = {
  article: React.PropTypes.object.isRequired,
  rank: React.PropTypes.number.isRequired,
  clicked: React.PropTypes.bool.isRequired,
  windowSize: React.PropTypes.number,
};
