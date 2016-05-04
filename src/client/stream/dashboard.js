'use strict';

import React from 'react';

import LoadingImage from '../components/loading-image';
import StreamArticle from './components/stream-article';

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      articlesLoaded: false,
      fadeOutLoading: false,
    }
  }

  componentWillReceiveProps(nextProps) {
    let articles = nextProps.store.Articles.articles;
    console.log(articles.length);
    if (articles.length && !this.state.fadeOutLoading) {
      this.setState({ fadeOutLoading: true });
      setTimeout(() => {
        this.setState({ articlesLoaded: true });
      }, 500);
    }
  }

  renderArticles() {
    let articles = this.props.store.Articles.articles
    if (!this.state.articlesLoaded) {
      let className = 'loading-image-container';
      if (this.state.fadeOutLoading) className += ' fade-out';
      return (
        <div className={ className }>
          <LoadingImage key={ 'stream-loading' }/>
        </div>
      )
    }

    articles.sort( (a, b) => { return a.created_at - b.created_at });
    let articleComponents = [];
    for (let article of articles) {
      articleComponents.push(
        <StreamArticle article={ article } key={ `stream-article-${article.url}`}/>
      )
    }

    return (
      <div className='articles'>
        { articleComponents }
      </div>
    )
  }

  render() {

    return (
      <div>
        { this.renderArticles() }
      </div>
    )
  }
}
