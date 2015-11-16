'use strict';

import React from 'react';
import Dispatcher from '../dispatcher';
import { ArticleActions } from '../store/article-store';

class ActiveArticle extends React.Component {
  constructor(props) {
    super(props);
    this.state = { photoLoaded: false }
  }

  componentWillMount() { this.loadPhoto(); }

  loadPhoto() {
    let article = this.props.article;
    if (!article.photo) return;

    let i = new Image();

    i.onload = () => { this.setState({ photoLoaded: true }) }
    i.src = article.photo.full.url;
  }

  closeActiveArticle(e) {
    if (!(/(close-article|active-article-container)/.test(e.target.className))) return;
    Dispatcher.dispatch({
      type: ArticleActions.closeActiveArticle
    });
  }

  renderImage() {
    let article = this.props.article;
    if (!article.photo || !this.state.photoLoaded) return null;

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
          <div className='summary-header'>Summary</div>
          { this.renderImage() }
          <div className='article-content'>
            <div className='title'>{ article.headline }</div>
            <div className='readers'>{ `Current Readers: ${this.props.readers}` }</div>
            <hr/>
            <div className='summary-container'>
              { article.summary.map(this.renderSummarySentence) }
            </div>
          </div>
          <div className='article-controls'>
            <div className='control start-speed-reader inactive'>Speed Read</div>
            <div className='control close-article'>Close</div>
          </div>
        </div>
      </div>
    )
  }

}

module.exports = ActiveArticle
