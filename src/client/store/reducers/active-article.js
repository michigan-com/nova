'use strict';

import Cookies from 'cookies-js';

import { ARTICLE_SELECTED, ARTICLE_LOADING, ARTICLE_LOADED, START_SPEED_READING,
  STOP_SPEED_READING, CLOSE_ACTIVE_ARTICLE, DEFAULT_ARTICLE } from '../../actions/active-article';
import { GOT_TOP_ARTICLES } from '../../actions/article-list';

export default function (state=DEFAULT_ARTICLE, action) {
  let articleLoading, activeArticle, speedReading;
  switch (action.type) {
    case ARTICLE_LOADING:
      let readers = action.value;
      articleLoading = true;
      return assign({}, state, { readers, articleLoading })
    case ARTICLE_LOADED:
      activeArticle = action.value;
      articleLoading = false;
      return assign({}, state, { activeArticle, articleLoading });
    case CLOSE_ACTIVE_ARTICLE:
      articleLoading = false;
      activeArticle = null;
      speedReading = false;
      return assign({}, state, { articleLoading, activeArticle, speedReading });
    case START_SPEED_READING:
      speedReading = true;
      return assign({}, state, { speedReading });
    case STOP_SPEED_READING:
      speedReading = false;
      return assign({}, state, { speedReading });
    case GOT_TOP_ARTICLES:
      if (!state.activeArticle || state.articleLoading) return state;
      let articles = action.value;
      let activeArticleReaders = getActiveArticleReaders(articles, state);
      if (activeArticleReaders >= 0) {
        return assign({}, state, { activeArticleReaders });
      }
  }
  return state;
}
