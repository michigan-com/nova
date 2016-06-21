'use strict';

export const ARTICLES_FETCHED = 'ARTICLES_FETCHED';


export function articlesFetched(articles = []) {
  return {
    type: ARTICLES_FETCHED,
    value: articles,
  };
}


export const DEFAULT_STATE = {
  articles: [],
  activeArticle: -1,
};
