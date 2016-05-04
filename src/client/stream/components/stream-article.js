'use strict';

import React from 'react';

export default class StreamArticle extends React.Component {
  getArticleStyle() {
    return {
      height: '75px'
    }
  }

  renderImage() {
    let article = this.props.article;
    if (article.photo === null) return null;

    let style = {
      backgroundImage: `url(${article.photo.thumbnail.url})`
    }
    return (
      <div className='image-container'>
        <div className='image' style={ style }></div>
      </div>
    )
  }

  renderHeadline() {
    let article = this.props.article;

    return (
      <div className='headline-container'>
        <div className='headline'>{ article.headline }</div>
        <div className='published-time'>{ article.created_at }</div>
      </div>
    )
  }

  render() {
    console.log(this.props);
    let style = this.getArticleStyle();
    return (
      <div className='stream-article' style={ style }>
        { this.renderImage() }
        { this.renderHeadline() }
      </div>
    )
  }
}
