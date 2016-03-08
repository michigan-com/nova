'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import Store, { DEFAULT_STATE } from '../store';
import InfoTile from './components/info-tile';
import TopArticle, { getTopArticleHeight } from './components/top-article';
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
    //if ((nextProps.activeArticle && !this.props.activeArticle)) {
    if(nextProps.articleLoading && !this.props.articleLoading) {
      this.lastScrollTop = document.body.scrollTop;
      document.body.scrollTop = 0;
    }

    // We closed the active article
    if (!!this.props.activeArticle && !nextProps.activeArticle) {
      document.body.scrollTop = this.lastScrollTop;
      this.setState({ activeArticleClose: true });
    }

    // The active article probably threw a 404
    else if (this.props.articleLoading && !nextProps.articleLoading && !nextProps.activeArticle) {
      this.setState({ activeArticleClose: true });
      document.body.scrollTop = this.lastScrollTop;
    }
  }

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
    let rank = 0;
    for (let index = 0; index < this.props.topArticles.length; index++) {
      let article = this.props.topArticles[index];

      if (rank === 3) {
        topArticles.push(
          <InfoTile type='inline' rank={ rank } infoText={ this.props.infoText } key={ 'info-tile-1' }/>
        )
        rank += 1;
      }

      topArticles.push(
        <TopArticle article={ article }
            rank={ rank }
            windowSize={ this.state.windowSize }
            clicked={ this.props.clickedArticles.has(article.article_id) }
            key={ `article-${article.url}` }/>
      )

      rank += 1;
    }

    // Have to draw in the same order every time, so sort by article ID before rendering
    // Rank positioning is done within <TopArticle/> Component
    topArticles.sort((a,b) => {
      if (!b.props.article) return -1;
      else if (!a.props.article) return 1;
      return b.props.article.article_id - a.props.article.article_id
    });

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
      let dashboardContainerClass = 'dashboard-container';
      if (topArticles.length) style.height = topArticles.length * (getTopArticleHeight() + 10); // Height * padding
      else dashboardContainerClass += ' articles-loading';

      let topArticlesContainerClass = 'top-articles-container';
      if (this.state.activeArticleClose) topArticlesContainerClass += ' active-article-close';
      dashboardContents = (
        <div className={ dashboardContainerClass }>
          <Header readers={ this.props.readers }
            showInfo={ this.props.showInfo }
            appName={ appName }/>
          <div className='definitions'>
            <div className='readers-container'><div className='readers'>readers</div></div>
            <div className='articles'>article</div>
          </div>
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

      // Info Stuff
      infoText={ state.ArticleList.infoBlurbs[state.ArticleList.blurbIndex] }

      key='now-dashboard'/>,
    document.getElementById('now')
  )
}

module.exports = { initDashboard }

