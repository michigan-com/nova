'use strict';

import React from 'react';
import Dispatcher from '../dispatcher';
import { ArticleActions } from '../store/article-store';

class ActiveArticle extends React.Component {

  closeActiveArticle(e) {
    if (/\s+close-article|active-article-container\s+/.test(e.target.className)) return;
    Dispatcher.dispatch({
      type: ArticleActions.closeActiveArticle
    });
  }

  renderImage() {
    let article = this.props.article;
    if (!article.photo) return null;

    let style = {
      backgroundImage: `url(${article.photo.full.url})`
    }

    return (
      <div className='image-container' style={ style }></div>
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
    let article = this.props.article;

    return (
      <div className='active-article-container' onClick={ this.closeActiveArticle.bind(this) }>
        <div className='active-article'>
          <div className='close-article'>X</div>
          <div className='summary-header'>Summary</div>
          { this.renderImage() }
          <div className='summary-container'>
            <div className='title'>{ article.headline }</div>
            <div className='readers'>{ `Current Readers: ${this.props.readers}` }</div>
            <div className='summary-container'>
              { article.summary.map(this.renderSummarySentence) }
            </div>
          </div>
        </div>
      </div>
    )
  }

}

module.exports = ActiveArticle
