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

      fadeOutArticle: false,
    };

    this.blurPhoto = this.blurPhoto.bind(this);
    this.photoLoaded = this.photoLoaded.bind(this);
  }

  componentWillMount() {
    if (this.props.article.photo !== null) this.loadPhoto();
    document.body.scrollTop = 0;
  }

  componentDidMount() {
    setTimeout(() => {
      this.setState({ fadeInContent: true });
    }, 1000);

    window.addEventListener('scroll', this.blurPhoto);
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.blurPhoto);
  }

  getBackgroundStyle() {
    const style = {};
    style.filter = this.state.photoBlur ? `blur(${this.state.photoBlur}px)` : 'blur(0px)';
    style.WebkitFilter = this.state.photoBlur ? `blur(${this.state.photoBlur}px)` : 'blur(0px)';
    if (this.state.photoLoaded) {
      style.opacity = this.state.photoBlur ? 1 - (this.state.photoBlur / 5) : 1;
    }
    document.body.className = document.body.className.replace(/\s*photo-loading\s*/, '');
    return style;
  }

  blurPhoto() {
    if (document.body.scrollTop >= 0) {
      this.setState({ photoBlur: document.body.scrollTop / (window.innerHeight / 10) });
    } else {
      this.setState({ photoBlur: 0 });
    }
  }

  photoLoaded = () => {
    this.setState({
      photoLoaded: true,
      fadeInPhoto: true,
    });
  }

  loadPhoto() {
    const article = this.props.article;
    const i = new Image();
    i.src = article.photo.full.url;
  }

  closeActiveArticle() {
    // TODO
    this.setState({ fadeOutArticle: true });
    setTimeout(() => { this.props.closeActiveArticle(this.props.article.article_id); }, 500);
  }

  // Speed reader button changes locations based on scroll height
  renderSummarySentence = (sentence, index) => (
    <div className="summary-sentence" key={`summary-${index}`}>
      <div className="summary-index">{index + 1}</div>
      <div className="sentence">{sentence}</div>
    </div>
  )

  renderReaders() {
    if (!this.props.readers) return <div className="current-readers-container"></div>;

    return (
      <div className="current-readers-container">
        <span className="readers">{`${this.props.readers || '-'}`}</span>
        <span className="pipe-divider">|</span>
        <span>now reading</span>
      </div>
    );
  }

  render() {
    let activeArticleContainerClass = 'active-article-container';
    if (this.state.fadeInPhoto) activeArticleContainerClass += ' photo-loaded';
    let articleImageClass = 'article-image';
    if (this.state.fadeInPhoto) articleImageClass += ' fade-in';
    else if (this.state.photoLoaded && !this.state.fadeInPhoto) articleImageClass += ' fade-out';

    if (this.state.fadeOutArticle) activeArticleContainerClass += ' fade-out-article';

    let article = this.props.article;
    let imageWrapperStyle = {};
    let articlePhotoUrl = '';
    if (article.photo !== null) {
      articlePhotoUrl = article.photo.small && window.innerWidth < 400 ?
        article.photo.small.url : article.photo.full.url;
      imageWrapperStyle.height = article.photo.full.width < article.photo.full.height ?
        document.documentElement.style.setProperty('--active-article-top-padding', '60vh') :
        document.documentElement.style.setProperty('--active-article-top-padding', '35vh');
      imageWrapperStyle.backgroundColor = this.state.photoLoaded ? 'white' : 'inherit';
    }
    let activeArticleClass = 'active-article';
    let articleContentClass = 'article-content';
    if (this.state.fadeImageOut) {
      activeArticleClass += ' fade-out';
      articleContentClass += ' fade-in';
    }
    if (this.state.fadeInContent) {
      articleContentClass += ' fade-in';
    }

    const summary = article.summary || [];

    return (
      <div className={activeArticleContainerClass} >
        <div className={activeArticleClass} ref="active-article">
          <div className="image-wrapper" style={imageWrapperStyle} >
            <img
              alt={articlePhotoUrl}
              src={articlePhotoUrl}
              className={articleImageClass}
              style={this.getBackgroundStyle()}
              onLoad={this.photoLoaded}
            />
          </div>
          <div className="article-content-container" ref="article-content-container">
            <div className={articleContentClass} ref="article-content">
              {this.renderReaders()}
              <div className="title">{article.headline}</div>
              <div className="summary-container">
                <div className="summary-title">Bot Summary</div>
                {summary.map(this.renderSummarySentence)}
              </div>
            </div>
          </div>
        </div>
        <SpeedReader
          article={article}
          startSpeedReading={this.props.startSpeedReading}
          stopSpeedReading={this.props.stopSpeedReading}
          key={`speed-reader-${article.article_id}`}
        />
        <div className="back-button-container">
          <div className="back-button" onClick={() => { this.closeActiveArticle(); }}>
            <i className="fa fa-arrow-left"></i>
            <div className="text">Feed</div>
          </div>
        </div>
      </div>
    );
  }
}

ActiveArticle.propTypes = {
  article: React.PropTypes.object.isRequired,
  closeActiveArticle: React.PropTypes.func.isRequired,
  readers: React.PropTypes.number,
  stopSpeedReading: React.PropTypes.func.isRequired,
  startSpeedReading: React.PropTypes.func.isRequired,
};
