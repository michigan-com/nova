'use strict';

import xr from 'xr';
import assign from 'object-assign';

import { appName, socketUrl } from '../../../config';
import { millisToMinutesAndSeconds } from '../lib/parse';
import { googleTagEvent, ARTICLE_SELECTED_EVENT, ARTICLE_LOADED_EVENT,
  ARTICLE_LOAD_FAILED_EVENT, ARTICLE_CLOSED_EVENT, STOP_SPEED_READING_EVENT } from './tag-manager';

export const ARTICLE_SELECTED = 'ARTICLE_SELECTED';
export const ARTICLE_LOADING = 'ARTICLE_LOADING';
export const ARTICLE_LOADED = 'ARTICLE_LOADED';
export const ARTICLE_LOAD_FAILED  = 'ARTICLE_LOAD_FAILED ';
export const START_SPEED_READING = 'START_SPEED_READING';
export const STOP_SPEED_READING = 'STOP_SPEED_READING';
export const CLOSE_ACTIVE_ARTICLE = 'CLOSE_ACTIVE_ARTICLE';

var articleCache = {};
var speedReadingStartTime = null;

/**
 * Iterate through the active articles, update the active readers
 *
 * @param {Array} articles - New set of top articles
 * @param {Object} state - current state of things
 */
export function getActiveArticleReaders(articles, state) {
  if (state.articleLoading || !state.activeArticle) return -1;
  for (let article of articles) {
    if (state.activeArticle.article_id === article.article_id &&
        state.activeArticle.source === article.source) {
      return article.visits;
    }
  }
  return -1;
}

/**
 * Hit the api at ${socketUrl} and fetch the article. Promised based.
 *
 * @param {Number} articleId - id of the selected article
 */
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

/**
 * Action triggered when a user clicks on a top article in the list. Attempts
 * to load the article from the api, and closes the article if it fails
 *
 * @param {Number} articleId - ID of the selected article, will be used to look up in api
 * @param {Number} readers - Init the active article with the readers, so we dont have
 *  to wait for the next socket update
 */
export function articleSelected(articleId=-1, readers=0) {
  googleTagEvent(ARTICLE_SELECTED_EVENT, { articleId } )
  return async dispatch => {
    dispatch(articleLoading(readers));
    try {
      let article = await fetchActiveArticle(articleId);
      dispatch(articleLoaded(article));
    } catch (e) {
      console.log(e);
      dispatch(articleLoadFailed(articleId));
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
  googleTagEvent(ARTICLE_LOADED_EVENT, { articleId: article.article_id });
  return {
    type: ARTICLE_LOADED,
    value: article
  }
}

export function startSpeedReading() {
  speedReadingStartTime = new Date();
  return {
    type: START_SPEED_READING
  }
}

export function stopSpeedReading() {
  // Do the google tag for tracking speed reading time
  if (speedReadingStartTime !== null) {
    let stopTime = new Date();
    let delta = stopTime - speedReadingStartTime;
    speedReadingStartTime = null;

    let speedReadingTime = millisToMinutesAndSeconds(delta);
    googleTagEvent(STOP_SPEED_READING_EVENT, { speedReadingTime });
  }

  return {
    type: STOP_SPEED_READING
  }
}

export function closeActiveArticle(changeHistory=true) {
  speedReadingStartTime = null;
  if (changeHistory) History.pushState({}, appName, '/');
  return {
    type: CLOSE_ACTIVE_ARTICLE
  }
}

export function articleLoadFailed(articleId=-1) {
  googleTagEvent(ARTICLE_LOAD_FAILED_EVENT, { articleId });
  return {
    type: ARTICLE_LOAD_FAILED
  }
}

export const DEFAULT_ARTICLE = {
  activeArticle: null,
  speedReading: false,
  articleLoading: false,
  activeArticleReaders: -1
}
