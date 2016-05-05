'use strict';

import React from 'react';
import moment from 'moment';

export default class StreamArticle extends React.Component {
  getArticleStyle() {
    let article = this.props.article;
    let rank = this.props.rank
    let style = {
      height: '75px',
      animationDelay: `${rank * 50}ms`
    };

    return style
  }

  renderImage() {
    let article = this.props.article;
    let style = {};
    if (article.photo != null) style.backgroundImage = `url(${article.photo.thumbnail.url})`;

    return (
      <div className='photo-container' style={ style }>
      </div>
    )
  }

  renderHeadline() {
    let article = this.props.article;

    return (
      <div className='headline-container'>
        <div className='headline'>{ article.headline }</div>
         <div className='published-time'>{ moment(article.created_at).format('MMMM Do YYYY, h:mm a')}</div>
      </div>
    )
  }

  render() {
    let style = this.getArticleStyle();
    return (
      <div className='stream-article-container'>
        <div className='stream-article' style={ style }>
          { this.renderImage() }
          { this.renderHeadline() }
        </div>
      </div>
    )
  }
}
