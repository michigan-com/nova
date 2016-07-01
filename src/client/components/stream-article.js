'use strict';

import React from 'react';
import moment from 'moment';

import Store from '../store';
import { articleSelected } from '../actions/active-article';

export const STREAM_ARTICLE_STYLE = {
  height: '75px',
};

export default class StreamArticle extends React.Component {
  constructor(props) {
    super(props);
    this.onClick = this.onClick.bind(this);
  }

  onClick() {
    Store.dispatch(articleSelected(this.props.article.article_id));
  }

  getArticleStyle() {
    const rank = this.props.rank;
    const style = {
      ...STREAM_ARTICLE_STYLE,
      animationDelay: `${rank * 50}ms`,
    };

    return style;
  }

  renderImage() {
    const article = this.props.article;
    let style = {};
    if (article.photo != null) style.backgroundImage = `url(${article.photo.small.url})`;

    return (
      <div className="photo-container" style={style}>
      </div>
    );
  }

  renderHeadline() {
    const article = this.props.article;

    return (
      <div className="headline-container">
        <div className="headline">{article.headline}</div>
        <div className="published-time">
          {moment(article.created_at).format('MMMM Do YYYY, h:mm a')}
        </div>
      </div>
    );
  }

  render() {
    let style = this.getArticleStyle();
    return (
      <div className="stream-article-container">
        <div className="stream-article" style={style} onClick={this.onClick}>
          {this.renderImage()}
          {this.renderHeadline()}
        </div>
      </div>
    );
  }
}

StreamArticle.propTypes = {
  article: React.PropTypes.object.isRequired,
  rank: React.PropTypes.number.isRequired,
};
