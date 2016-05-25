'use strict';

import React from 'react';

import SpeedReader from './speed-reader';


export default class ActiveArticle extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      photoLoaded: false,
      fadeInPhoto: false,
      fadeImageOut: false,
      fadeInContent: false,
      fadeSpeedReader: false,

      fadeOutArticle: false
    }
  }
  componentWillUnmount(){
    window.removeEventListener('scroll', this.blurPhoto);
  }
  componentWillMount() {
    this.loadPhoto();
    document.body.scrollTop = 0;
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ fadeInContent: true });
    }, 1000);

    window.addEventListener('scroll', this.blurPhoto);
    console.log('active-article-mount');
  }
  blurPhoto = (e) => {
    if(document.body.scrollTop >= 0){
      this.setState({ photoBlur: document.body.scrollTop / (window.innerHeight / 10) });
    } else {
      this.setState({ photoBlur: 0 });
    }
  }
  photoLoaded = () => {
    this.setState({ photoLoaded: true });

    setTimeout(() => {
      this.setState({ fadeInPhoto: true });
    }, 300);
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
    setTimeout(() => { this.props.closeActiveArticle(this.props.article.article_id) }, 500);
  }

  getBackgroundStyle() {
    let article = this.props.article;
    let style = {}
    style.filter = this.state.photoBlur ? `blur(${this.state.photoBlur}px)` : 'blur(0px)';
    style.WebkitFilter = this.state.photoBlur ? `blur(${this.state.photoBlur}px)` : 'blur(0px)';
    style.transform = this.state.photoBlur ? `scale(${1.05 + (this.state.photoBlur / 20)})` : 'scale(1.05)';
    document.body.className = document.body.className.replace(/\s*photo-loading\s*/, '');

    if (this.state.photoLoaded && this.state.fadeInPhoto && !!article.photo) {
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

  renderReaders() {
    if (!this.props.readers) return <div className='current-readers-container'></div>

    return (
      <div className='current-readers-container'>
        <span className='readers'>{ `${this.props.readers || '-' }` }</span>
        <span className='pipe-divider'>|</span>
        <span>now reading</span>
      </div>
    )
  }

  render() {
    let activeArticleContainerClass = 'active-article-container';
    if (this.state.fadeInPhoto) activeArticleContainerClass += ' photo-loaded';

    let articleImageClass = 'article-image'
    if (this.state.fadeInPhoto) articleImageClass += ' fade-in';
    else if (this.state.photoLoaded && !this.state.fadeInPhoto) articleImageClass += ' fade-out';

    if (this.state.fadeOutArticle) activeArticleContainerClass += ' fade-out-article';

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

    let summary = article.summary || [];

    let speedReaderContainerClass = 'speed-reader-container';
    return (
      <div className={ activeArticleContainerClass } >
        <div className={ activeArticleClass } ref='active-article'>
          <div className='image-wrapper'>
            <div className={ articleImageClass } style={ this.getBackgroundStyle() }>
            </div>
          </div>
          <div className='article-content-container' ref='article-content-container'>
            <div className={ articleContentClass } ref='article-content'>
              { this.renderReaders() }
              <div className='title'>{ article.headline }</div>
              <div className='summary-container'>
                <div className='summary-title'>Bot Summary</div>
                { summary.map(this.renderSummarySentence) }
              </div>
            </div>
          </div>
        </div>
        <SpeedReader article={ article }
            startSpeedReading={ this.props.startSpeedReading }
            stopSpeedReading={ this.props.stopSpeedReading }
            key={ `speed-reader-${article.article_id}` }/>
        <div className='back-button-container'>
          <div className='back-button' onClick={ () => { this.closeActiveArticle() } }>
            <i className='fa fa-arrow-left'></i>
            <div className='text'>Feed</div>
          </div>
        </div>
      </div>
    )
  }
}
