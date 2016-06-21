'use strict';

import React from 'react';
import { findDOMNode } from 'react-dom';
import Infinite from 'react-infinite';
import moment from 'moment';

import Store from './store';
import { closeActiveArticle, startSpeedReading, stopSpeedReading }
  from '../common/actions/active-article';
import Header from '../common/components/header';
import ActiveArticle from '../common/components/active-article';
import LoadingImage from '../common/components/loading-image';
import StreamArticle from './components/stream-article';
import Config from '../../../config';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      articlesLoaded: false,
      fadeOutLoading: false,
      timeFrame: '',
    };

    this.lastScrollTop = document.body.scrollTop;

    this.articleList = null;
  }

  componentWillReceiveProps(nextProps) {
    const articles = nextProps.store.Articles.articles;
    if (articles.length && !this.state.fadeOutLoading) {
      this.setTimeFrame(articles[0]);
      this.setState({ fadeOutLoading: true });
      setTimeout(() => {
        this.setState({ articlesLoaded: true });
      }, 500);
    }

    const nextActiveArticle = nextProps.store.ActiveArticle.activeArticle;
    const thisActiveArticle = this.props.store.ActiveArticle.activeArticle;
    if (!thisActiveArticle && !!nextActiveArticle) {
      this.lastScrollTop = window.scrollY;
      this.unregisterScrollHandlers();
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.articlesLoaded && !prevState.articlesLoaded) this.registerScrollHandlers();

    const prevActiveArticle = prevProps.store.ActiveArticle.activeArticle;
    const thisActiveArticle = this.props.store.ActiveArticle.activeArticle;
    if (!thisActiveArticle && !!prevActiveArticle) {
      document.body.scrollTop = this.lastScrollTop;
      this.registerScrollHandlers();
    }
  }

  componentWillUnmount() {
    this.unregisterScrollHandlers();
  }

  setTimeFrame(article) {
    let timeFrame = moment(article.created_at);
    const minute = timeFrame.minute();
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

  startSpeedReading(articleId) {
    Store.dispatch(startSpeedReading(articleId));
  }

  stopSpeedReading(articleId) {
    Store.dispatch(stopSpeedReading(articleId));
  }

  /** Store events that need to be passed down to children */
  closeActiveArticle(articleId) {
    Store.dispatch(closeActiveArticle(articleId));
  }

  registerScrollHandlers() {
    window.addEventListener('scroll', this.checkScroll);
  }

  unregisterScrollHandlers() {
    window.removeEventListener('scroll', this.checkScroll);
  }

  checkScroll = () => {
    const articles = this.props.store.Articles.articles;
    if (!articles.length) return;

    const list = findDOMNode(this.articleList);
    const percentScrolled = window.scrollY / list.clientHeight;
    const articleIndex = Math.round(articles.length * percentScrolled);
    this.setTimeFrame(articles[articleIndex]);
  }


  renderArticles() {
    const articles = this.props.store.Articles.articles;
    if (!this.state.articlesLoaded) {
      let className = 'loading-image-container';
      if (this.state.fadeOutLoading) className += ' fade-out';
      return (
        <div className={className}>
          <LoadingImage key={'stream-loading'} />
        </div>
      );
    }

    const articleIds = new Set();
    let articleComponents = [];
    let rank = 0;
    for (let article of articles) {
      const articleId = article.article_id;
      if (articleIds.has(articleId)) continue;
      articleIds.add(articleId);

      articleComponents.push(
        <StreamArticle rank={rank} article={article} key={`stream-article-${article.url}`} />
      );
      rank += 1;
    }

    return (
      <div className="articles">
        <Infinite
          containerHeight={articleComponents.length * 75}
          elementHeight={75}
          useWindowAsScrollContainer
          ref={(ref) => { this.articleList = ref; }}
        >
          {articleComponents}
        </Infinite>
      </div>
    );
  }

  renderTime() {
    return (
      <div className="time-frame">
        <div className="blurb">Vieweing articles published around</div>
        <div className="time-frame-time">{this.state.timeFrame}</div>
      </div>
    );
  }

  render() {
    const store = this.props.store;
    const activeArticle = store.ActiveArticle.activeArticle;
    if (activeArticle !== null) {
      return (
        <div className="stream">
          <ActiveArticle
            article={activeArticle}
            readers={0}
            speedReading={store.ActiveArticle.speedReading}
            closeActiveArticle={this.closeActiveArticle}
            startSpeedReading={this.startSpeedReading}
            stopSpeedReading={this.stopSpeedReading}
          />
        </div>
      );
    }

    return (
      <div className="stream">
        <Header appName={Config.appName} />
        {this.renderArticles()}
        {this.renderTime()}
      </div>
    );
  }
}

Dashboard.propTypes = {
  store: React.PropTypes.object.isRequired,
};
