'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import uaParser from 'ua-parser-js';
import { batchActions } from 'redux-batched-actions';

import Store, { DEFAULT_STATE } from './store';
import { closeActiveArticle, startSpeedReading, stopSpeedReading }
    from '../common/actions/active-article';
import { showProfilePage, hideProfilePage } from '../common/actions/user';
import { regularSignup } from '../common/actions/signup';
import InfoTile from './components/info-tile';
import TopArticle, { getTopArticleHeight } from './components/top-article';
import ActiveArticle from '../common/components/active-article';
import LoadingImage from '../common/components/loading-image';
import Header from '../common/components/header';
import SectionFilters from './components/filters';
import PhoneInput from './components/phone-number-input';
import ProfilePage from '../common/components/profile-page';
import BreakingNewsTile from './components/breaking-news-tile';
import Theme from '../common/components/mui-theme';

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
    } else if (this.props.articleLoading && !nextProps.articleLoading && !nextProps.activeArticle) {
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

  /**
   *  Determins if we need to show a input box for phone numbers. If on desktop,
   *  show the input. Else, don't show input
   *
   *  @return {Boolean} True if we're to show the input, false otherwise
   */
  parseUaString() {
    const uaResult = uaParser();
    return typeof uaResult.device.type === 'undefined';
  }

  resize = () => {
    const currentWidth = window.innerWidth;

    if (this.prevWindowWidth <= this.windowMid &&
        currentWidth > this.windowMid) {
      this.setState({ windowSize: this.windowSmall });
    } else if (this.prevWindowWidth > this.windowMid &&
        currentWidth <= this.windowMid) {
      this.setState({ windowSize: this.windowMid });
    }
    this.prevWindowWidth = currentWidth;
  }

  /** Store events that need to be passed down to children */
  closeActiveArticle(articleId) {
    Store.dispatch(closeActiveArticle(articleId));
  }

  startSpeedReading(articleId) {
    Store.dispatch(startSpeedReading(articleId));
  }

  stopSpeedReading(articleId) {
    Store.dispatch(stopSpeedReading(articleId));
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

    const topArticles = [];
    const userLoggedIn = this.props.User.userInfo !== null;
    const breakingNewsArticleExists = this.props.BreakingNews.breakingNewsArticles.length !== 0;
    let rank = 0;

    if (breakingNewsArticleExists) {
      topArticles.push(
        <BreakingNewsTile
          breakingNewsArticle={this.props.BreakingNews.breakingNewsArticles[0]}
          windowSize={this.state.windowSize}
          userLoggedIn={userLoggedIn}
          key={'breaking-news-tile'}
        />
      );

      if (userLoggedIn) rank += 1;
      else rank += 3;
    }

    for (let index = 0; index < this.props.topArticles.length; index++) {
      let article = this.props.topArticles[index];

      if (rank === 3 && !breakingNewsArticleExists) {
        if (this.onDesktop && this.props.showInput && !this.props.dismissInput) {
          topArticles.push(
            <PhoneInput rank={rank} expandInput={this.props.expandInput} key="phone-input-tile" />
          );

          if (this.props.expandInput) rank += 2;
          else rank += 1;
        } else {
          topArticles.push(
            <InfoTile
              type="inline"
              rank={rank}
              infoText={this.props.infoText}
              key={'info-tile-1'}
            />
          );
          rank += 1;
        }
      }

      topArticles.push(
        <TopArticle
          article={article}
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
      } else if (!b.props.article) {
        return 1;
      } else if (!a.props.article) {
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
    } else if (this.props.activeArticle !== null) {
      dashboardContents = (
        <div className="dashboard-container">
          <ActiveArticle
            article={this.props.activeArticle}
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
      if (topArticles.length) {
        style.height = (topArticles.length + 1) * (getTopArticleHeight() + 10); // Height * padding
      } else {
        dashboardContainerClass += ' articles-loading';
      }

      let topArticlesContainerClass = 'top-articles-container';
      if (this.state.activeArticleClose) topArticlesContainerClass += ' active-article-close';
      dashboardContents = (
        <div className={dashboardContainerClass}>
          <Header
            readers={this.props.readers}
            userId={this.props.User.userId}
            appName={appName}
            onProfileClick={() => {
              Store.dispatch(batchActions([
                regularSignup(),
                showProfilePage(),
              ]));
            }}
          />
          <div className="definition-container">
            <div className="definitions">
              <div className="readers-container"><div className="readers">readers</div></div>
              <div className="articles">article</div>
            </div>
          </div>
          <div className={topArticlesContainerClass} style={style}>
            {topArticles}
          </div>
          <SectionFilters
            sections={this.props.sections}
            activeSectionIndex={this.props.activeSectionIndex}
          />
          <ProfilePage
            Signup={this.props.Signup}
            User={this.props.User}
            dispatch={Store.dispatch}
            onClose={() => { Store.dispatch(hideProfilePage()); }}
          />
        </div>
      );
    }

    return dashboardContents;
  }
}

NowDashboard.propTypes = {
  topArticles: React.PropTypes.array.isRequired,
  articleLoading: React.PropTypes.bool.isRequired,
  activeArticle: React.PropTypes.object,
  showInput: React.PropTypes.bool,
  dismissInput: React.PropTypes.bool,
  expandInput: React.PropTypes.bool,
  infoText: React.PropTypes.element,
  clickedArticles: React.PropTypes.object, // actually a set
  activeArticleReaders: React.PropTypes.number,
  speedReading: React.PropTypes.bool,
  readers: React.PropTypes.number,
  sections: React.PropTypes.array,
  activeSectionIndex: React.PropTypes.number,
  User: React.PropTypes.object,
  Signup: React.PropTypes.object,
  BreakingNews: React.PropTypes.object,
};

NowDashboard.childContextTypes = {
  dispatch: React.PropTypes.func,
};


function drawDashboard(state = DEFAULT_STATE) {
  let activeArticleReaders = 0;
  if (state.ActiveArticle.activeArticle != null) {
    const activeArticle = state.ActiveArticle.activeArticle;
    for (const article of state.ArticleList.topArticles) {
      if (activeArticle.article_id === article.article_id &&
          activeArticle.source === article.source) {
        activeArticleReaders = article.visits;
        break;
      }
    }
  }

  ReactDOM.render(
    <Theme>
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


        // User Stuff
        User={state.User}

        // Signup Stuff
        Signup={state.Signup}

        // Breaking News Stuff
        BreakingNews={state.BreakingNews}

        key="now-dashboard"
      />
    </Theme>,
    document.getElementById('now')
  );
}

function initDashboard() {
  // Draw the inital dashboard with no articles
  drawDashboard();

  // Draw the dashboard when the articles update
  Store.subscribe(() => { drawDashboard(Store.getState()); });
}


module.exports = { initDashboard };
