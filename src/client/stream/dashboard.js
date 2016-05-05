'use strict';

import React from 'react';
import { findDOMNode } from 'react-dom';
import Infinite from 'react-infinite';
import moment from 'moment';

import Header from '../components/header';
import LoadingImage from '../components/loading-image';
import StreamArticle from './components/stream-article';
import Config from '../../../config';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      articlesLoaded: false,
      fadeOutLoading: false,
      timeFrame: ''
    }

    this.articleList = null;
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.articlesLoaded && !prevState.articlesLoaded) {
      let list = findDOMNode(this.articleList);
      window.addEventListener('scroll', this.checkScroll.bind(this));
    }
  }

  componentWillUnmount() {
    let list = findDOMNode(this.articleList);
    window.removeEventListener('scroll', this.checkScroll.bind(this));
  }

  componentWillReceiveProps(nextProps) {
    let articles = nextProps.store.Articles.articles;
    if (articles.length && !this.state.fadeOutLoading) {
      this.setTimeFrame(articles[0]);
      this.setState({ fadeOutLoading: true });
      setTimeout(() => {
        this.setState({ articlesLoaded: true });
      }, 500);
    }
  }

  checkScroll() {
    let articles = this.props.store.Articles.articles;
    if (!articles.length) return;

    let list = findDOMNode(this.articleList);
    let percentScrolled = window.scrollY / list.clientHeight;
    let articleIndex = Math.round(articles.length * percentScrolled);
    console.log(`${window.scrollY} / ${list.clientHeight}`);
    this.setTimeFrame(articles[articleIndex]);
  }

  setTimeFrame(article) {
    let timeFrame = moment(article.created_at);
    let minute = timeFrame.minute();
    if (minute <= 15) {
      timeFrame = timeFrame.startOf('hour');
    } else if (minute > 15 && minute < 45) {
      timeFrame.minute(30);
    } else {
      timeFrame = timeFrame.add('1', 'hour').startOf('hour');
    }

    timeFrame = timeFrame.format('MMMM Do YYYY, h:mm a');
    this.setState({ timeFrame });
  }

  renderArticles() {
    let articles = this.props.store.Articles.articles
    if (!this.state.articlesLoaded) {
      let className = 'loading-image-container';
      if (this.state.fadeOutLoading) className += ' fade-out';
      return (
        <div className={ className }>
          <LoadingImage key={ 'stream-loading' }/>
        </div>
      )
    }

    let articleIds = new Set();
    let articleComponents = [];
    let rank = 0;
    for (let article of articles) {
      let articleId = article.article_id;
      if (articleIds.has(articleId)) continue;
      articleIds.add(articleId);

      articleComponents.push(
        <StreamArticle rank={ rank } article={ article } key={ `stream-article-${article.url}`}/>
      )
      rank += 1;
    }

    return (
      <div className='articles'>
        <Infinite containerHeight= { articleComponents.length * 75 } elementHeight={ 75 }
          useWindowAsScrollContainer
          ref={ (ref) => { this.articleList = ref }}>
          { articleComponents }
        </Infinite>
      </div>
    )
  }

  renderTime() {
    return (
      <div className='time-frame'>
        <div className='blurb'>Vieweing articles published around</div>
        <div className='time-frame-time'>{ this.state.timeFrame }</div>
      </div>
    )
  }

  render() {
    return (
      <div className='stream'>
        <Header appName={ Config.appName }/>
        { this.renderArticles() }
        { this.renderTime() }
      </div>
    )
  }
}
