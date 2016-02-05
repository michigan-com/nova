'use strict';

import xr from 'xr';
import assign from 'object-assign';

import { appName, socketUrl } from '../../../config';

export const ARTICLE_SELECTED = 'ARTICLE_SELECTED';
export const ARTICLE_LOADING = 'ARTICLE_LOADING';
export const ARTICLE_LOADED = 'ARTICLE_LOADED';
export const START_SPEED_READING = 'START_SPEED_READING';
export const STOP_SPEED_READING = 'STOP_SPEED_READING';
export const CLOSE_ACTIVE_ARTICLE = 'CLOSE_ACTIVE_ARTICLE';

var articleCache = {};

export function getActiveArticleReaders(articles, state) {
  if (state.articleLoading || !state.activeArticle) return -1;
  for (let article of articles) {
    if (state.activeArticle.article_id === article.id &&
        state.activeArticle.source === article.source) {
      return article.visits;
    }
  }
  return -1;
}

function fetchActiveArticle(articleId) {
    return new Promise((resolve, reject) => {
      let _renderArticleFromCache = (id) => {
        let article = articleCache[id];
        History.pushState({ id }, `${article.headline}`, `/article/${id}/`);
        resolve(article);
      }

      if (articleId in articleCache) {
        // TODO set some cache threshold. Maybe a cache entry is stale after 24 hours?
        _renderArticleFromCache(articleId);
      } else {
        let url = `${socketUrl}/v1/article/${articleId}/`;
        xr.get(url)
          .then((data) => {
            articleCache[articleId] = data;
            _renderArticleFromCache(articleId);
          }, (e) => {
            console.log(`Failed to fetch article ${socketUrl}/v1/article/${articleId}/`);
            reject(e);
        });
      }
    });
}

export function articleSelected(articleId=-1, readers=0) {
  return async dispatch => {
    dispatch(articleLoading(readers));
    try {
      let article = await fetchActiveArticle(articleId);
      dispatch(articleLoaded(article));
    } catch (e) {
      console.log(e);
      dispatch(closeActiveArticle());
    }
  }
}

export function articleLoading(readers=0) {
  return {
    type: ARTICLE_SELECTED,
    value: readers
  }
}

export function articleLoaded(article=null) {
  return {
    type: ARTICLE_LOADED,
    value: article
  }
}

export function startSpeedReading() {
  return {
    type: START_SPEED_READING
  }
}

export function stopSpeedReading() {
  return {
    type: STOP_SPEED_READING
  }
}

export function closeActiveArticle(changeHistory=true) {
  if (changeHistory) History.pushState({}, appName, '/');
  return {
    type: CLOSE_ACTIVE_ARTICLE
  }
}

export const DEFAULT_ARTICLE = {
  activeArticle: null,
  speedReading: false,
  articleLoading: false,
  activeArticleReaders: -1
}
