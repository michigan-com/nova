'use strict';

import React from 'react';
import { findDOMNode } from 'react-dom';
import Infinite from 'react-infinite';
import moment from 'moment';
import { batchActions } from 'redux-batched-actions';

import Store from '../store';
import { regularSignup } from '../actions/signup';
import { showProfilePage } from '../actions/user';
import LoadingImage from './loading-image';
import StreamArticle from './stream-article';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      articlesLoaded: !!this.props.StreamArticles.articles.length,
      fadeOutLoading: false,
      timeFrame: '',
    };

    this.lastScrollTop = document.body.scrollTop;

    this.articleList = null;
  }

  componentWillMount() {
    this.registerScrollHandlers();
    if (this.props.StreamArticles.articles.length) {
      this.setTimeFrame(this.props.StreamArticles.articles[0]);
    }
  }

  componentWillReceiveProps(nextProps) {
    const nextArticles = nextProps.StreamArticles.articles;
    const thisArticles = this.props.StreamArticles.articles;

    if (!thisArticles.length !== nextArticles.length) {
      this.checkScroll();
    }

    if (!thisArticles.length && nextArticles.length) {
      this.setTimeFrame(nextArticles[0]);
      this.setState({ fadeOutLoading: true });
      setTimeout(() => {
        this.setState({ articlesLoaded: true });
      }, 500);
    }
  }

  componentWillUnmount() {
    this.unregisterScrollHandlers();
  }

  setTimeFrame(article) {
    const now = new Date();
    const currentArticleTime = moment(article.created_at);
    const ONE_MINUTE = 1000 * 60;
    const ONE_HOUR = ONE_MINUTE * 60;
    const ONE_DAY = ONE_HOUR * 24;
    let delta = now - currentArticleTime;

    const timeFrameValues = [];
    if (delta > ONE_DAY) {
      const numDays = Math.round(delta / ONE_DAY);
      const append = numDays <= 1 ? 'day' : 'days';
      timeFrameValues.push(`${numDays} ${append}`);
      delta -= (numDays * ONE_DAY);
    }
    if (delta > ONE_HOUR) {
      const numHours = Math.round(delta / ONE_HOUR);
      const append = numHours <= 1 ? 'hour' : 'hours';
      timeFrameValues.push(`${numHours} ${append}`);
      delta -= (numHours * ONE_HOUR);
    }
    if (delta > ONE_MINUTE) {
      const numMinutes = Math.round(delta / ONE_MINUTE);
      const append = numMinutes <= 1 ? 'minute' : 'minutes';
      timeFrameValues.push(`${numMinutes} ${append}`);
    }

    if (timeFrameValues.length === 0) timeFrameValues.push('Now!');
    else timeFrameValues.push('ago');

    const timeFrame = timeFrameValues.join(' ');
    this.setState({ timeFrame });
  }

  checkScroll = () => {
    const articles = this.props.StreamArticles.articles;
    if (!articles.length) return;

    const list = findDOMNode(this.articleList);
    const percentScrolled = window.scrollY / list.clientHeight;
    const articleIndex = Math.round(articles.length * percentScrolled);
    this.setTimeFrame(articles[articleIndex]);
  }

  registerScrollHandlers() {
    window.addEventListener('scroll', this.checkScroll);
  }

  unregisterScrollHandlers() {
    window.removeEventListener('scroll', this.checkScroll);
  }

  renderArticles() {
    const articles = this.props.StreamArticles.articles;
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
      if (articleIds.has(articleId) || !articleId) continue;
      articleIds.add(articleId);

      articleComponents.push(
        <StreamArticle rank={rank} article={article} key={`stream-article-${article.url}`} />
      );
      rank += 1;
    }

    return (
      <div className="articles" style={{ marginBottom: '100px' }}>
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
        <div className="blurb">Viewing articles published</div>
        <div className="time-frame-time">{this.state.timeFrame}</div>
      </div>
    );
  }

  render() {
    if (this.context.User.userId === null) {
      return (
        <div className="stream">
          <div className="signup-prompt">
            <h2>Wanna access even more news content?</h2>
            <p>Signup to gain access to even more features!</p>
            <div
              className="signup-button"
              onClick={() => {
                Store.dispatch(batchActions([
                  regularSignup(),
                  showProfilePage(),
                ]));
              }}
            >
              Signup Now
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="stream">
        {this.renderArticles()}
        {this.renderTime()}
      </div>
    );
  }
}

Dashboard.propTypes = {
  StreamArticles: React.PropTypes.object.isRequired,
};

Dashboard.contextTypes = {
  User: React.PropTypes.object,
};
