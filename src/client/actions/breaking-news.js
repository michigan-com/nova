'use strict';

export const UPDATE_BREAKING_NEWS_ARTICLES = 'UPDATE_BREAKING_NEWS_ARTICLES';

export function updateBreakingNewsArticles(articles = []) {
  return {
    type: UPDATE_BREAKING_NEWS_ARTICLES,
    value: articles,
  };
}

export const DEFAULT_STATE = {
  breakingNewsArticles: [],
};
