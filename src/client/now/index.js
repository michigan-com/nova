'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';

import { Store, defaultArticleStore } from '../store/article-store';
import TopArticle from './top-article';
import ActiveArticle from './active-article';

// Format thousands numbers
// http://blog.tompawlak.org/number-currency-formatting-javascript
function formatNumber(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

class NowDashboard extends React.Component {
  static defaultProps = defaultArticleStore();

  renderHeader() {
    // TODO figure out if we want to normalize this time to detroit
    // or if we want it to be the client's computer
    let now = new Date();

    let greeting = 'Hello';
    let hour = now.getHours();
    if (hour > 0 && hour < 12) greeing = 'Good Morning';
    else if (hour >= 12 && hour < 6) greeting = 'Good Afternoon';
    else if (hour >= 6) greeting = 'Good Evening';

    let readers = '';
    if (this.props.readers > 0) readers = `${formatNumber(this.props.readers)} now reading`;

    return(
      <div id='header'>
        <div id='page-header'>Detroit Now</div>
        <div id='greeting'>{ `${greeting}, Michigan` }</div>
        <div id='readers'>
          <div id='glasses'><img src='/img/glasses.svg'/></div>
          <div id='readers'>{ readers }</div>
        </div>
      </div>
    )
  }

  renderArticles() {
    if (!this.props.topArticles || !this.props.topArticles.length) {
      return (
        <div id='top-articles' className='loading'>
          Loading ...
        </div>
      )
    }

    let topArticles = [];
    for (let index = 0; index < this.props.topArticles.length; index++) {
      let article = this.props.topArticles[index];
      topArticles.push(
        <TopArticle article={ article }
            rank={ index }
            clicked={ this.props.clickedArticles.has(article.article_id) }
            key={ `article-${article.url}` }/>
      )
    }

    // Have to draw in the same order every time, so sort by article ID before rendering
    // Rank positioning is done within <TopArticle/> Component
    topArticles.sort((a,b) => { return b.props.article.article_id - a.props.article.article_id });

    return (
      <div id='top-articles'>
        { topArticles }
      </div>
    )
  }

  renderActiveArticle() {
    if (!this.props.activeArticle || this.props.articleLoading) return null;

    return (
      <ActiveArticle article={ this.props.activeArticle } readers={ this.props.activeArticleReaders }/>
    )
  }

  render() {
    return (
      <div className='dashboard-container'>
        <div className='header-container'>
          { this.renderHeader() }
        </div>
        <div className='top-articles-container'>
          { this.renderArticles() }
        </div>
        <div className={ `article-loading-overlay${this.props.articleLoading ? 'show' : ''}` }></div>
        { this.renderActiveArticle() }
      </div>
    )
  }
}

function initDashboard() {
  // Draw the inital dashboard with no articles
  drawDashboard();

  // Draw the dashboard when the articles update
  Store.addChangeListener(function(store) {
    drawDashboard(store.topArticles,
                  store.readers,
                  store.articleLoading,
                  store.activeArticle,
                  store.clickedArticles,
                  store.activeArticleReaders);
  });
}

function drawDashboard(topArticles=[], readers=-1, articleLoading=false,
                        activeArticle=null, clickedArticles=new Map(),
                        activeArticleReaders=0) {
  ReactDOM.render(
    <NowDashboard topArticles={ topArticles }
      readers={ readers }
      clickedArticles={ clickedArticles }
      activeArticle={ activeArticle }
      activeArticleReaders={ activeArticleReaders }
      articleLoading={ articleLoading }/>,
    document.getElementById('now')
  )
}

module.exports = { initDashboard }

