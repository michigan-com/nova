'use strict';

import React from 'react';

import Store from '../../store';
import { closeActiveArticle } from '../../actions/active-article';
import LoadingImage from './loading-image';
import SpeedReader from './speed-reader';
import { toggleClass } from '../../lib/dom';

export default class ActiveArticle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photoLoaded: false,
      fadeImageOut: false,
      fadeInContent: false,
      fadeSpeedReader: false,

      fadeOutArticle: false
    }
  }

  componentWillMount() {
    this.loadPhoto();
    document.body.scrollTop = 0;
  }
  componentDidMount() {}

  componentWillReceiveProps(nextProps) {
    if (nextProps.speedReading && !this.props.speedReading) {
      this.setState({ fadeSpeedReader: true });
    } else if (!nextProps.speedReading && this.props.speedReading) {
      this.setState({ fadeSpeedReader: true});
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.fadeSpeedReader && !prevState.fadeSpeedReader) {
      setTimeout(() => {
        this.setState({ fadeSpeedReader: false });
      }, 500);
    }
  }

  photoLoaded = () => {
    setTimeout(() => {
      this.setState({ photoLoaded: true });
    }, 500);

    setTimeout(() => {
      this.setState({ fadeInContent: true });
    }, 1000);
  }

  loadPhoto() {
    document.body.className = `${document.body.className} photo-loading`;
    let article = this.props.article;
    if (!article.photo) {
      this.photoLoaded();
      return;
    }

    let i = new Image();

    i.onload = () => { this.photoLoaded(); }
    i.src = article.photo.full.url;
  }

  closeActiveArticle(e) {
    // TODO
    this.setState({ fadeOutArticle: true });
    setTimeout(() => { Store.dispatch(closeActiveArticle()); }, 500);
  }

  getBackgroundStyle() {
    let article = this.props.article;
    let style = {}

    document.body.className = document.body.className.replace(/\s*photo-loading\s*/, '');

    if (this.state.photoLoaded && !!article.photo) {
      style.backgroundImage = `url(${article.photo.full.url})`;
    }
    return style;
  }

  // Speed reader button changes locations based on scroll height
  renderSummarySentence = (sentence, index) => {
    return (
      <div className='summary-sentence' key={ `summary-${index}` }>
        <div className='summary-index'>{ index + 1 }</div>
        <div className='sentence'>{ sentence }</div>
      </div>
    )
  }

  render() {
    let activeArticleContainerClass = 'active-article-container';
    if (this.state.photoLoaded) activeArticleContainerClass += ' photo-loaded';

    if (this.state.fadeSpeedReader) activeArticleContainerClass += ' fade-in-speed-reader';
    else if (this.props.speedReading) activeArticleContainerClass += ' speed-reading';
    else if (this.state.fadeOutArticle) activeArticleContainerClass += ' fade-out-article';

    let article = this.props.article;
    let activeArticleClass = 'active-article';
    let articleContentClass = 'article-content';
    if (this.state.fadeImageOut) {
      activeArticleClass += ' fade-out';
      articleContentClass += ' fade-in';
    }
    if (this.state.fadeInContent) {
      articleContentClass += ' fade-in';
    }

    let speedReaderContainerClass = 'speed-reader-container';
    return (
      <div className={ activeArticleContainerClass } >
        <div className={ activeArticleClass } ref='active-article'>
          <div className='article-image' style={ this.getBackgroundStyle() }></div>
          <div className='article-content-container' ref='article-content-container'>
            <div className={ articleContentClass } ref='article-content'>
              <div className='current-readers-container'>
                <span className='readers'>{ `${this.props.readers || '-' }` }</span>
                <span className='pipe-divider'>|</span>
                <span>now reading</span>
              </div>
              <div className='title'>{ article.headline }</div>
              <div className='summary-container'>
                <div className='summary-title'>Summary</div>
                { article.summary.map(this.renderSummarySentence) }
              </div>
            </div>
          </div>
        </div>
        <SpeedReader article={ article }
            key={ `speed-reader-${article.article_id}` }/>
        <div className='context-menu'>
          <div className='menu-button' onClick={ () => { Store.dispatch(closeActiveArticle()); }}>
            <img src='/img/cards.svg'/>
            <div className='button-text'>Feed</div>
          </div>
        </div>
      </div>
    )
  }
}

