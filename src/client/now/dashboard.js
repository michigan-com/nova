'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import uaParser from 'ua-parser-js';

import Store, { DEFAULT_STATE } from './store';
import { closeActiveArticle, startSpeedReading, stopSpeedReading } from '../common/actions/active-article';
import InfoTile from './components/info-tile';
import TopArticle, { getTopArticleHeight } from './components/top-article';
import ActiveArticle from '../common/components/active-article';
import LoadingImage from '../common/components/loading-image';
import Header from '../common/components/header';
import SectionFilters from './components/filters';
import PhoneInput from './components/phone-number-input';

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
  'Compressing time requirements...',
];

class NowDashboard extends React.Component {
  constructor(props) {
    super(props);

    this.lastScrollY = 0;

    this.lastScrollTop = document.body.scrollTop;

    this.prevWindowWidth = window.innerWidth;
    this.windowSmall = 768;
    this.windowMid = 992;

    window.onresize = this.resize;

    this.onDesktop = this.parseUaString();

    this.state = {
      articlesLoading: true,
      windowSize: window.innerWidth > 992 ? this.windowMid : this.windowSmall,
      showInfo: false,
      activeArticleClose: false,
    };
  }

  /**
   *  Determins if we need to show a input box for phone numbers. If on desktop,
   *  show the input. Else, don't show input
   *
   *  @return {Boolean} True if we're to show the input, false otherwise
   */
  parseUaString() {
    let uaResult = uaParser();
    return typeof uaResult.device.type === 'undefined';
  }

  resize = () => {
    let currentWidth = window.innerWidth;

    if (this.prevWindowWidth <= this.windowMid &&
        currentWidth > this.windowMid) {
      this.setState({ windowSize: this.windowSmall });
    }
    else if (this.prevWindowWidth > this.windowMid &&
        currentWidth <= this.windowMid) {
      this.setState({ windowSize: this.windowMid });
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
    // if ((nextProps.activeArticle && !this.props.activeArticle)) {
    if (nextProps.articleLoading && !this.props.articleLoading) {
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

  /** Store events that need to be passed down to children */
  closeActiveArticle(article_id) {
    Store.dispatch(closeActiveArticle(article_id));
  }

  startSpeedReading(article_id) {
    Store.dispatch(startSpeedReading(article_id));
  }

  stopSpeedReading(article_id) {
    Store.dispatch(stopSpeedReading(article_id));
  }

  renderArticles() {
    if (this.state.articlesLoading || !this.props.topArticles.length) {
      let className = 'loading-image-container';
      if (this.state.fadeOutLoading) className += ' fade-out';
      return (
        <div className={className}>
          <LoadingImage blurbs={loadingBlurbs} key="articles-loading" />
        </div>
      );
    }

    let topArticles = [];
    let rank = 0;
    for (let index = 0; index < this.props.topArticles.length; index++) {
      let article = this.props.topArticles[index];

      if (rank === 3) {
        if (this.onDesktop && this.props.showInput && !this.props.dismissInput) {
          topArticles.push(
            <PhoneInput rank={rank} expandInput={this.props.expandInput} key="phone-input-tile" />
          );

          if (this.props.expandInput) rank += 2;
          else rank += 1;
        } else {
          topArticles.push(
            <InfoTile type="inline" rank={rank} infoText={this.props.infoText} key={'info-tile-1'} />
          );
          rank += 1;
        }
      }

      topArticles.push(
        <TopArticle article={article}
          rank={rank}
          windowSize={this.state.windowSize}
          clicked={this.props.clickedArticles.has(article.article_id)}
          key={`article-${article.url}`}
        />
      );

      rank += 1;
    }

    // Have to draw in the same order every time, so sort by article ID before rendering
    // Rank positioning is done within <TopArticle/> Component
    topArticles.sort((a, b) => {
      // These if statements are for info tiles
      if (!b.props.article && !a.props.article) {
        return b.props.rank - a.props.rank;
      }
      else if (!b.props.article) {
        return 1;
      }
      else if (!a.props.article) {
        return -1;
      }
      return b.props.article.article_id - a.props.article.article_id;
    });

    return topArticles;
  }

  render() {
    let dashboardContents = null;
    if (this.props.articleLoading) {
      dashboardContents = (
        <div className="dashboard-container">
        </div>
      );
    } else if (this.props.activeArticle != null) {
      dashboardContents = (
          <div className="dashboard-container">
            <ActiveArticle article={this.props.activeArticle}
              readers={this.props.activeArticleReaders}
              speedReading={this.props.speedReading}
              closeActiveArticle={this.closeActiveArticle}
              startSpeedReading={this.startSpeedReading}
              stopSpeedReading={this.stopSpeedReading}
            />
          </div>
        );
    } else {
      let topArticles = this.renderArticles();
      let style = {};
      let dashboardContainerClass = 'dashboard-container';
      if (topArticles.length) style.height = (topArticles.length + 1) * (getTopArticleHeight() + 10); // Height * padding
      else dashboardContainerClass += ' articles-loading';

      let topArticlesContainerClass = 'top-articles-container';
      if (this.state.activeArticleClose) topArticlesContainerClass += ' active-article-close';
      dashboardContents = (
        <div className={dashboardContainerClass}>
          <Header readers={this.props.readers} appName={appName} />
          <div className="definition-container">
            <div className="definitions">
              <div className="readers-container"><div className="readers">readers</div></div>
              <div className="articles">article</div>
            </div>
          </div>
          <div className={topArticlesContainerClass} style={style}>
            {topArticles}
          </div>
          <SectionFilters sections={this.props.sections} activeSectionIndex={this.props.activeSectionIndex} />
        </div>
      );
    }

    return dashboardContents;
  }
}

function drawDashboard(state = DEFAULT_STATE) {
  let activeArticleReaders = 0;
  if (state.ActiveArticle.activeArticle != null) {
    let activeArticle = state.ActiveArticle.activeArticle;
    for (let article of state.ArticleList.topArticles) {
      if (activeArticle.article_id === article.article_id &&
          activeArticle.source === article.source) {
        activeArticleReaders = article.visits;
        break;
      }
    }
  }

  ReactDOM.render(
    <NowDashboard
      // Article list
      topArticles={state.ArticleList.topArticles}
      readers={state.ArticleList.totalReaders}
      clickedArticles={state.ArticleList.clickedArticles}
      sections={state.ArticleList.sections}
      showInfo={state.ArticleList.showInfo}

      // Active Article
      activeArticle={state.ActiveArticle.activeArticle}
      speedReading={state.ActiveArticle.speedReading}
      activeArticleReaders={activeArticleReaders}
      articleLoading={state.ActiveArticle.articleLoading}

      // Info Stuff
      infoText={state.ArticleList.infoBlurbs[state.ArticleList.blurbIndex]}

      // Phone number input
      showInput={state.PhoneNumber.showInput}
      dismissInput={state.PhoneNumber.dismissInput}
      expandInput={state.PhoneNumber.expandInput}

      key="now-dashboard"
    />,
    document.getElementById('now')
  );
}

export function initDashboard() {
  // Draw the inital dashboard with no articles
  drawDashboard();

  // Draw the dashboard when the articles update
  Store.subscribe(() => { drawDashboard(Store.getState()); });
}
