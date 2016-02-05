'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import Store, { DEFAULT_STATE } from '../store';
import TopArticle from './components/top-article';
import ActiveArticle from './components/active-article';
import SectionFilters from './filters';
import LoadingImage from './components/loading-image';
import Header from './components/header';

import { appName } from '../../../config';

let loadingBlurbs = [
  'Bots are summarizing...',
  'Artificial intelligence at work...',
  'Algorithms analyzing news...',
  'Summary engine cranking...',
  'Fetching just the news you need...',
  'News distillation in process...',
  'Reducing time-to-smart ratios...',
  'Speed reader revving up...',
  'Greasing the speed reader...',
  'Shaving demands on your attention...',
  'Compressing time requirements...'
]

class NowDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.lastScrollY = 0;

    this.lastScrollTop = document.body.scrollTop;

    this.prevWindowWidth = window.innerWidth;
    this.windowSmall = 768;
    this.windowMid = 992;

    window.onresize = this.resize;

    this.state = {
      articlesLoading: true,
      windowSize: window.innerWidth > 992 ? this.windowMid : this.windowSmall,
      showInfo: false,
      activeArticleClose: false
    }
  }

  resize = () => {
    let currentWidth = window.innerWidth;

    if (this.prevWindowWidth <= this.windowMid &&
        currentWidth > this.windowMid) {
      this.setState({ windowSize: this.windowSmall })
    }
    else if (this.prevWindowWidth > this.windowMid &&
        currentWidth <= this.windowMid) {
      this.setState({ windowSize: this.windowMid })
    }
    this.prevWindowWidth = currentWidth;
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.topArticles.length && nextProps.topArticles.length) {
      this.setState({ fadeOutLoading: true });
      setTimeout(() => {
        this.setState({ articlesLoading: false });
      }, 1000);
    }

    // So we don't lose our place in the list
    if ((nextProps.activeArticle && !this.props.activeArticle)) {
      this.lastScrollTop = document.body.scrollTop;
      document.body.scrollTop = 0;
    }

    // We closed the active article
    if (!!this.props.activeArticle && !nextProps.activeArticle) {
      this.setState({ activeArticleClose: true });
    }

    // The active article probably threw a 404
    else if (this.props.articleLoading && !nextProps.articleLoading && !nextProps.activeArticle) {
      this.setState({ activeArticleClose: true });
    }
  }

  componentDidMount() { window.addEventListener('scroll', this.checkScroll); }

  // Save what articles are currently drawn
  componentDidUpdate(prevProps, prevState) {
    if (!prevState.activeArticleClose && this.state.activeArticleClose) {
      document.body.scrollTop = this.lastScrollTop;
      setTimeout(() => {
        this.setState({ activeArticleClose: false });
      }, 250);
    }
  }

  renderArticles() {
    if (this.state.articlesLoading || !this.props.topArticles.length) {
      let className = 'loading-image-container';
      if (this.state.fadeOutLoading) className += ' fade-out';
      return (
        <div className={ className }>
          <LoadingImage blurbs={ loadingBlurbs } key='articles-loading'/>
        </div>
      )
    }

    let topArticles = [];
    for (let index = 0; index < this.props.topArticles.length; index++) {
      let article = this.props.topArticles[index];
      topArticles.push(
        <TopArticle article={ article }
            rank={ index }
            windowSize={ this.state.windowSize }
            clicked={ this.props.clickedArticles.has(article.article_id) }
            key={ `article-${article.url}` }/>
      )
    }

    // Have to draw in the same order every time, so sort by article ID before rendering
    // Rank positioning is done within <TopArticle/> Component
    topArticles.sort((a,b) => { return b.props.article.article_id - a.props.article.article_id });

    return topArticles;
  }

  render() {
    let dashboardContents = null;
    if (this.props.articleLoading) {
      dashboardContents = (
        <div className='dashboard-container'>
        </div>
      )
    } else if (this.props.activeArticle != null) {
        dashboardContents = (
          <div className='dashboard-container'>
            <ActiveArticle article={ this.props.activeArticle }
                  readers={ this.props.activeArticleReaders }
                  speedReading={ this.props.speedReading }/>
          </div>
        )
    } else {
      let topArticles = this.renderArticles();
      let style = {};
      if (topArticles.length) style.height = topArticles.length * (TopArticle.getHeight() + 10); // Height * padding

      let topArticlesContainerClass = 'top-articles-container';
      if (this.state.activeArticleClose) topArticlesContainerClass += ' active-article-close';
      dashboardContents = (
        <div className='dashboard-container'>
          <Header readers={ this.props.readers }
            showInfo={ this.props.showInfo }
            appName={ appName }/>
          <div className={ topArticlesContainerClass } style={ style }>
            { topArticles }
          </div>
          <SectionFilters sections={ this.props.sections } activeSectionIndex={ this.props.activeSectionIndex }/>
        </div>
      )
    }

    return dashboardContents;
  }
}

function initDashboard() {
  // Draw the inital dashboard with no articles
  drawDashboard();

  // Draw the dashboard when the articles update
  Store.subscribe(() => { drawDashboard(Store.getState()); });
}

function drawDashboard(state=DEFAULT_STATE) {
  ReactDOM.render(
    <NowDashboard
      // Article list
      topArticles={ state.ArticleList.topArticles }
      readers={ state.ArticleList.totalReaders }
      clickedArticles={ state.ArticleList.clickedArticles }
      sections={ state.ArticleList.sections }
      showInfo={ state.ArticleList.showInfo }

      // Active Article
      activeArticle={ state.ActiveArticle.activeArticle }
      speedReading={ state.ActiveArticle.speedReading }
      activeArticleReaders={ state.ActiveArticle.activeArticleReaders }
      articleLoading={ state.ActiveArticle.articleLoading }

      key='now-dashboard'/>,
    document.getElementById('now')
  )
}

module.exports = { initDashboard }

