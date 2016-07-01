'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import uaParser from 'ua-parser-js';
import { batchActions } from 'redux-batched-actions';

import Store, { DEFAULT_STATE } from '../store';
import { closeActiveArticle, startSpeedReading, stopSpeedReading }
    from '../actions/active-article';
import { showProfilePage, hideProfilePage } from '../actions/user';
import { regularSignup } from '../actions/signup';
import { STREAM_ARTICLES } from '../actions/nav';
import ActiveArticle from './active-article';
import Header from './header';
import UserNav from './user-nav';
import ProfilePage from './profile-page';
import Theme from './mui-theme';
import TopArticleList from './top-article-list';
import StreamList from './stream-list';

import { appName } from '../../../config';

class Dashboard extends React.Component {
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
      windowSize: window.innerWidth > 992 ? this.windowMid : this.windowSmall,
      activeArticleClose: false,
    };
  }

  getChildContext() {
    return {
      User: this.props.User,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.ActiveArticle.articleLoading && !this.props.ActiveArticle.articleLoading) {
      this.lastScrollTop = document.body.scrollTop;
      document.body.scrollTop = 0;
    }

    // We closed the active article
    if (!!this.props.ActiveArticle.activeArticle && !nextProps.ActiveArticle.activeArticle) {
      document.body.scrollTop = this.lastScrollTop;
      this.setState({ activeArticleClose: true });
    } else if (this.props.ActiveArticle.articleLoading && !nextProps.ActiveArticle.articleLoading
      && !nextProps.ActiveArticle.activeArticle) {
      this.setState({ activeArticleClose: true });
      document.body.scrollTop = this.lastScrollTop;
    }
  }

  componentDidUpdate(prevProps) {
    // We closed the active article
    if (!!prevProps.ActiveArticle.activeArticle && !this.props.ActiveArticle.activeArticle) {
      document.body.scrollTop = this.lastScrollTop;
    } else if (prevProps.ActiveArticle.articleLoading && !this.props.ActiveArticle.articleLoading
      && !this.props.ActiveArticle.activeArticle) {
      document.body.scrollTop = this.lastScrollTop;
    }
  }

  // // Save what articles are currently drawn
  // componentDidUpdate(prevProps, prevState) {
  //   if (!prevState.activeArticleClose && this.state.activeArticleClose) {
  //     document.body.scrollTop = this.lastScrollTop;
  //   }
  // }

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

  render() {
    let dashboardContents = null;
    if (this.props.ActiveArticle.articleLoading) {
      dashboardContents = (
        <div className="dashboard-container">
        </div>
      );
    } else if (this.props.ActiveArticle.activeArticle !== null) {
      dashboardContents = (
        <div className="dashboard-container">
          <ActiveArticle
            article={this.props.ActiveArticle.activeArticle}
            readers={this.props.ActiveArticle.activeArticleReaders}
            speedReading={this.props.ActiveArticle.speedReading}
            closeActiveArticle={this.closeActiveArticle}
            startSpeedReading={this.startSpeedReading}
            stopSpeedReading={this.stopSpeedReading}
          />
        </div>
      );
    } else {
      const topArticles = this.props.ArticleList.topArticles;
      let dashboardContainerClass = 'dashboard-container';
      if (!topArticles.length) {
        dashboardContainerClass += ' articles-loading';
      }

      let articleList = (
        <TopArticleList
          ArticleList={this.props.ArticleList}
          BreakingNews={this.props.BreakingNews}
          PhoneNumber={this.props.PhoneNumber}
        />
      );

      if (this.props.Nav.currentView === STREAM_ARTICLES) {
        articleList = (
          <StreamList
            StreamArticles={this.props.StreamArticles}
          />
        );
      }

      dashboardContents = (
        <div className={dashboardContainerClass}>
          <Header
            readers={this.props.ArticleList.totalReaders}
            userId={this.props.User.userId}
            appName={appName}
            onProfileClick={() => {
              Store.dispatch(batchActions([
                regularSignup(),
                showProfilePage(),
              ]));
            }}
          />
        {articleList}
          <UserNav sections={this.props.ArticleList.sections} Nav={this.props.Nav} />
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

Dashboard.propTypes = {
  Signup: React.PropTypes.object.isRequired,
  BreakingNews: React.PropTypes.object.isRequired,
  ActiveArticle: React.PropTypes.object.isRequired,
  ArticleList: React.PropTypes.object.isRequired,
  PhoneNumber: React.PropTypes.object.isRequired,
  User: React.PropTypes.object.isRequired,
  Nav: React.PropTypes.object.isRequired,
  StreamArticles: React.PropTypes.object.isRequired,
};

Dashboard.childContextTypes = {
  User: React.PropTypes.object,
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
      <Dashboard
        // Article list
        ArticleList={state.ArticleList}

        // Active Article
        ActiveArticle={state.ActiveArticle}
        activeArticleReaders={activeArticleReaders}

        // Phone number input
        PhoneNumber={state.PhoneNumber}

        // User Stuff
        User={state.User}

        // Signup Stuff
        Signup={state.Signup}

        // Breaking News Stuff
        BreakingNews={state.BreakingNews}

        // Nav Stuff
        Nav={state.Nav}

        // Stream stuff
        StreamArticles={state.StreamArticles}

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
