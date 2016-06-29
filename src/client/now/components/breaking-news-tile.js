'use strict';

import React from 'react';
import { batchActions } from 'redux-batched-actions';

import Store from '../store';
import { showProfilePage } from '../../common/actions/user';
import { breakingNewsSignup } from '../../common/actions/signup';
import TopArticle, { getTopArticleHeight, TOP_ARTICLE_STYLE } from './top-article';

const LIVE_READERS = 'Live';

export default class BreakingNewsTile extends React.Component {
  constructor(props) {
    super(props);

    this.breakingNewsSignup = this.breakingNewsSignup.bind(this);
  }

  breakingNewsSignup() {
    Store.dispatch(batchActions([
      breakingNewsSignup(),
      showProfilePage(),
    ]));
  }

  renderPromptAsNeeded() {
    if (this.props.userLoggedIn) return null;

    const height = (getTopArticleHeight() + TOP_ARTICLE_STYLE.margin) * 2;
    const top = getTopArticleHeight();
    const style = { height, top };

    return (
      <div className="breaking-news-prompt" style={style}>
        <p className="you-missed-out">
          You just missed this breaking news. Get breaking news alerts delivered
          direct to you via SMS
        </p>
        <div className="signup-button" onClick={this.breakingNewsSignup}>
          <p>Get Breaking News</p>
        </div>
      </div>
    );
  }

  render() {
    const breakingArticle = this.props.breakingNewsArticle;
    const topArticle = {
      article_id: breakingArticle.article_id,
      visits: LIVE_READERS,
      headline: breakingArticle.headline,
    };

    const topArticleHeight = getTopArticleHeight();
    let breakingNewsHeight = topArticleHeight;
    if (!this.props.userLoggedIn) {
      breakingNewsHeight *= 3;
      breakingNewsHeight += (TOP_ARTICLE_STYLE.margin * 2);
    }

    const style = {
      height: breakingNewsHeight,
    };


    return (
      <div className="breaking-news-tile-container">
        <div className="breaking-news-tile" style={style}>
          <TopArticle
            rank={0}
            article={topArticle}
            clicked={false}
            windowSize={this.props.windowSize}
            disableViewing={!this.props.userLoggedIn}
          />
          {this.renderPromptAsNeeded()}
        </div>
      </div>
    );
  }
}

BreakingNewsTile.propTypes = {
  breakingNewsArticle: React.PropTypes.object.isRequired,
  windowSize: React.PropTypes.number,
  userLoggedIn: React.PropTypes.bool,
};
