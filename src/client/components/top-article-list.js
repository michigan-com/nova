'use strict';

import React from 'react';

import TopArticle, { getTopArticleHeight } from './top-article';
import LoadingImage from './loading-image';
import BreakingNewsTile from './breaking-news-tile';
import PhoneInput from './phone-number-input';
import InfoTile from './info-tile';

const loadingBlurbs = [
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

export default class TopArticleList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      articlesLoading: !this.props.ArticleList.topArticles.length,
      windowSize: window.innerWidth > 992 ? this.windowMid : this.windowSmall,
      showInfo: false,
      activeArticleClose: false,
      fadeOutLoading: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.ArticleList.topArticles.length && nextProps.ArticleList.topArticles.length) {
      this.setState({ fadeOutLoading: true });
      setTimeout(() => {
        this.setState({ articlesLoading: false });
      }, 1000);
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
    if (this.state.articlesLoading || !this.props.ArticleList.topArticles.length) {
      let className = 'loading-image-container';
      if (this.state.fadeOutLoading) className += ' fade-out';
      return (
        <div className={className}>
          <LoadingImage blurbs={loadingBlurbs} key="articles-loading" />
        </div>
      );
    }

    const topArticles = [];
    const userLoggedIn = this.context.User.userInfo !== null;
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

    for (let index = 0; index < this.props.ArticleList.topArticles.length; index++) {
      let article = this.props.ArticleList.topArticles[index];

      if (rank === 3 && !breakingNewsArticleExists) {
        if (this.onDesktop && this.props.PhoneNumber.showInput &&
            !this.props.PhoneNumber.dismissInput) {
          topArticles.push(
            <PhoneInput
              rank={rank}
              expandInput={this.props.PhoneNumber.expandInput}
              key="phone-input-tile"
            />
          );

          if (this.props.PhoneNumber.expandInput) rank += 2;
          else rank += 1;
        } else {
          const infoText = this.props.ArticleList.infoBlurbs[this.props.ArticleList.blurbIndex];
          topArticles.push(
            <InfoTile
              type="inline"
              rank={rank}
              infoText={infoText}
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
          clicked={this.props.ArticleList.clickedArticles.has(article.article_id)}
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
    let topArticlesContainerClass = 'top-articles-container';
    if (this.state.activeArticleClose) topArticlesContainerClass += ' active-article-close';

    const style = {};
    const topArticles = this.props.ArticleList.topArticles;
    if (topArticles.length) {
      style.height = (topArticles.length + 2) * (getTopArticleHeight() + 10); // Height * padding
    }

    return (
      <div>
        <div className="definition-container">
          <div className="definitions">
            <div className="readers-container"><div className="readers">readers</div></div>
            <div className="articles">article</div>
          </div>
        </div>
        <div className={topArticlesContainerClass} style={style}>
          {this.renderArticles()}
        </div>
      </div>
    );
  }
}

TopArticleList.propTypes = {
  ArticleList: React.PropTypes.object.isRequired,
  BreakingNews: React.PropTypes.object.isRequired,
  PhoneNumber: React.PropTypes.object.isRequired,
};

TopArticleList.contextTypes = {
  User: React.PropTypes.object,
};
