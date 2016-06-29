'use strict';

import { DEFAULT_STATE, UPDATE_BREAKING_NEWS_ARTICLES } from '../../actions/breaking-news';

export default function reducer(state = DEFAULT_STATE, action) {
  let { breakingNewsArticles } = DEFAULT_STATE;
  switch (action.type) {
    case UPDATE_BREAKING_NEWS_ARTICLES:
      breakingNewsArticles = action.value;
      return { ...state, breakingNewsArticles };
    default:
      return state;
  }
}
