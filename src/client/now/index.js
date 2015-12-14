'use strict';

import React from 'react';
import ReactDOM from 'react-dom';

import { Store, defaultArticleStore } from '../store/article-store';
import TopArticle from './components/top-article';
import ActiveArticle from './components/active-article';
import SectionFilter from './components/section-filter';
import LoadingImage from './components/loading-image';

import Config from '../../../config';

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
    this.scrollMagnitude = 0;
    this.lastScrollY = 0;

    this.maxFilterTop = 0;
    this.minFilterTop = -100;

    this.lastClickedArticleId = -1;
    this.lastScrollTop = document.body.scrollTop;

    this.prevWindowWidth = window.innerWidth;
    this.windowSmall = 768;
    this.windowMid = 992;

    window.onresize = this.resize;

    this.state = {
      articlesLoading: true,
      filterTop: 0,
      windowSize: window.innerWidth > 992 ? this.windowMid : this.windowSmall,
      showInfo: false,
      activeArticleClose: false
    }
  }


  resize = () => {
    let currentWidth = window.innerWidth;

    if (this.prevWindowWidth <= this.windowMid && currentWidth > this.windowMid) {
      this.setState({ windowSize: this.windowSmall })
    }
    else if (this.prevWindowWidth > this.windowMid && currentWidth <= this.windowMid) {
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

    if ((nextProps.activeArticle && !this.props.activeArticle) && nextProps.activeArticle.articleId !== this.lastClickedArticleId) {
      this.lastScrollTop = document.body.scrollTop;
      document.body.scrollTop = 0;
      this.lastClickedArticleId = nextProps.activeArticle.article_id;
    }

    if (!!this.props.activeArticle && !nextProps.activeArticle) {
      this.setState({ activeArticleClose: true });
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.checkScroll);
  }

  // Save what articles are currently drawn
  componentDidUpdate(prevProps, prevState) {
    this.drawnArticles.clear()

    for (let article in this.props.topArticle) {
      this.drawnArticles.add(article.article_id);
    }

    if (!prevState.activeArticleClose && this.state.activeArticleClose) {
      document.body.scrollTop = this.lastScrollTop;
      this.lastClickedArticleId = -1;
      setTimeout(() => {
        this.setState({ activeArticleClose: false });
      }, 250);
    }
  }


  toggleInfo = () => {
    let showInfo = !this.state.showInfo;
    this.setState({ showInfo });
  }

  renderSectionOptions() {
    let activeSection = this.props.activeSectionIndex;

    return (
      <div className='filters-container'>
        <div className='filters'>
          {
            this.props.sections.map(function(section, index) {
              return (
                <SectionFilter name={ section.name }
                            displayName={ section.displayName }
                            active={ section.showArticles }
                            key={ `section-${section.name}` }/>
              )
            })
          }
        </div>
      </div>
    )
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
    if (this.props.readers > 0) readers = `${formatNumber(this.props.readers)} readers`;

    let siteInfoClass = 'site-info';
    if (this.state.showInfo) siteInfoClass += ' show';

    return(
      <div id='header'>
        <div className={ siteInfoClass }>
          <div className='info-content'>
            <p className='info-header'>{ `${Config.appName} uses artificial intelligence to give you essential news in less time.` }</p>
            <div className='list'>
              <p>{ `${Config.appName}'s algorithms surface the most-read Michigan news, in real-time.` }</p>
              <p>Its summarization engine distills each story down to the 3 details you need to know.</p>
              <p>The speed reader enables you to absorb the full story in a fraction of the normal time.</p>
            </div>
            <p className='feedback'>Feedback? We'd love to hear it.</p>
            <a href='#' id='email-us'>Email Us</a>
          </div>
        </div>
        <div className='header-info'>
          <div id='page-header'>{ Config.appName }</div>
          <div id='readers'>
            <div id='glasses'><img src='/img/glasses.svg'/></div>
            <div id='numbers'>{ readers }</div>
          </div>
          <div id='info' onClick={ this.toggleInfo }><span className='info-button'>i</span></div>
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

    let topArticles = [];
    for (let index = 0; index < this.props.topArticles.length; index++) {
      let article = this.props.topArticles[index];
      topArticles.push(
        <TopArticle article={ article }
            rank={ index }
            windowSize={ this.state.windowSize }
            clicked={ this.props.clickedArticles.has(article.article_id) }
            lastClickedArticle={ article.article_id === this.lastClickedArticleId }
            key={ `article-${article.url}` }/>
      )
    }

    // Have to draw in the same order every time, so sort by article ID before rendering
    // Rank positioning is done within <TopArticle/> Component
    topArticles.sort((a,b) => { return b.props.article.article_id - a.props.article.article_id });

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
      if (topArticles.length) style.height = topArticles.length * (TopArticle.getHeight() + 10); // Height * padding

      let topArticlesContainerClass = 'top-articles-container';
      if (this.state.activeArticleClose) topArticlesContainerClass += ' active-article-close';
      dashboardContents = (
        <div className='dashboard-container'>
          <div className='header-container'>
            { this.renderHeader() }
          </div>
          { this.renderSectionOptions() }
          <div className={ topArticlesContainerClass } style={ style }>
            { topArticles }
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
                  store.speedReading,
                  store.clickedArticles,
                  store.activeArticleReaders,
                  store.sections);
  });
}

function drawDashboard(topArticles=[], readers=-1, articleLoading=false,
                        activeArticle=null, speedReading=false, clickedArticles=new Map(),
                        activeArticleReaders=0, sections=[]) {
  ReactDOM.render(
    <NowDashboard topArticles={ topArticles }
      readers={ readers }
      clickedArticles={ clickedArticles }
      activeArticle={ activeArticle }
      speedReading={ speedReading }
      activeArticleReaders={ activeArticleReaders }
      articleLoading={ articleLoading }
      sections={ sections }
      key='now-dashboard'/>,
    document.getElementById('now')
  )
}

module.exports = { initDashboard }

