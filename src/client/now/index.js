'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import { Store, defaultArticleStore, getSections } from '../store/article-store';
import TopArticle from './components/top-article';
import ActiveArticle from './components/active-article';
import SectionFilter from './components/section-filter';
import LoadingImage from './components/loading-image';

// Format thousands numbers
// http://blog.tompawlak.org/number-currency-formatting-javascript
function formatNumber(num) {
      return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,")
}

var months = [ "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December" ];

class NowDashboard extends React.Component {
  static defaultProps = defaultArticleStore();
  constructor(props) {
    super(props);

    this.drawnArticles = new Set();
  }

  state = {
    articlesLoading: true
  }

  componentWillReceiveProps(nextProps) {
    if (!this.props.topArticles.length && nextProps.topArticles.length) {
      this.setState({ fadeOutLoading: true });
      setTimeout(() => {
        this.setState({ articlesLoading: false });
      }, 1000);
    }

    if (this.props.activeSectionIndex !== nextProps.activeSectionIndex) {
      this.drawnArticles.clear();
    }
  }

  // Save what articles are currently drawn
  componentDidUpdate() {
    this.drawnArticles.clear()

    for (let article in this.props.topArticle) {
      this.drawnArticles.add(article.article_id);
    }
  }

  renderHeader() {
    // TODO figure out if we want to normalize this time to detroit
    // or if we want it to be the client's computer
    let now = new Date();

    let greeting = 'Hello';
    let hour = now.getHours();
    if (hour > 0 && hour < 12) greeting = 'Good Morning';
    else if (hour >= 12 && hour < 6) greeting = 'Good Afternoon';
    else if (hour >= 6) greeting = 'Good Evening';

    let readers = '';
    if (this.props.readers > 0) readers = `${formatNumber(this.props.readers)} now reading`;

    return(
      <div id='header'>
        <div id='page-header'>Detroit Now</div>
        <div id='readers'>
          <div id='glasses'><img src='/img/glasses.svg'/></div>
          <div id='numbers'>{ readers }</div>
        </div>
        { this.renderSectionOptions() }
      </div>
    )
  }

  renderSectionOptions() {
    let sections = getSections();
    let activeSection = this.props.activeSectionIndex;

    return (
      <div className='filters-container'>
        <div className='filters'>
          {
            sections.map(function(section, index) {
              return (
                <SectionFilter name={ section }
                            active={ index === activeSection }
                            key={ `section-${section}` }/>
              )
            })
          }
        </div>
      </div>
    )
  }

  renderArticles() {
    if (this.state.articlesLoading || !this.props.topArticles.length) {
      let className = 'loading-image-container';
      if (this.state.fadeOutLoading) className += ' fade-out';
      return (
        <div className={ className }>
          <LoadingImage blurbs={ ['Loading the news...'] } key='articles-loading'/>
        </div>
      )
    }

    let currentSection = getSections()[this.props.activeSectionIndex];
    let topArticles = [];
    for (let index = 0; index < this.props.topArticles.length; index++) {
      let article = this.props.topArticles[index];
      topArticles.push(
        <TopArticle article={ article }
            rank={ index }
            clicked={ this.props.clickedArticles.has(article.article_id) }
            key={ `article-${currentSection}-${article.url}` }/>
      )
    }

    // Have to draw in the same order every time, so sort by article ID before rendering
    // Rank positioning is done within <TopArticle/> Component
    topArticles.sort((a,b) => { return b.props.article.article_id - a.props.article.article_id });

    return (
      <div>
        { topArticles }
      </div>
    )
  }

  render() {
    let dashboardContents = null;
    if (this.props.articleLoading) {
      dashboardContents = (
        <div className='dashboard-container'>
          <LoadingImage blurbs={ ['Loading article summary...'] }/>
        </div>
      )
    } else if (this.props.activeArticle != null) {
        dashboardContents = (
          <div className='dashboard-container'>
            <ActiveArticle article={ this.props.activeArticle } readers={ this.props.activeArticleReaders }/>
          </div>
        )
    } else {
      dashboardContents = (
        <div className='dashboard-container'>
          <div className='header-container'>
            { this.renderHeader() }
          </div>
          <div className='top-articles-container'>
            { this.renderArticles() }
          </div>
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
  Store.addChangeListener(function(store) {
    drawDashboard(store.topArticles,
                  store.readers,
                  store.articleLoading,
                  store.activeArticle,
                  store.clickedArticles,
                  store.activeArticleReaders,
                  store.activeSectionIndex);
  });
}

function drawDashboard(topArticles=[], readers=-1, articleLoading=false,
                        activeArticle=null, clickedArticles=new Map(),
                        activeArticleReaders=0, activeSectionIndex=0) {
  ReactDOM.render(
    <NowDashboard topArticles={ topArticles }
      readers={ readers }
      clickedArticles={ clickedArticles }
      activeArticle={ activeArticle }
      activeArticleReaders={ activeArticleReaders }
      articleLoading={ articleLoading }
      activeSectionIndex={ activeSectionIndex }
      key='now-dashboard'/>,
    document.getElementById('now')
  )
}

module.exports = { initDashboard }

