'use strict';

import Cookies from 'cookies-js';

export const GOT_TOP_ARTICLES = 'GOT_TOP_ARTICLES';
export const GOT_QUICKSTATS = 'GOT_QUICKSTATS';
export const TOGGLE_INFO = 'TOGGLE_INFO';

const ARTICLEID_COOKIE = 'articleIds';
/**
 * Read the cookie 'articleIds'. Expected to be a comma-separated list of numbers.
 * Will filter out anything that is not a number
 *
 * @returns {Set} Set of article IDs
 */
function getArticleIdsFromCookie() {
  let cookie = Cookies.get(ARTICLEID_COOKIE) || '';
  let cookieSplit = cookie.split(',');
  let articleIds = new Set();

  for (let value of cookieSplit) {
    if (isNaN(value)) continue;
    articleIds.add(parseInt(value));
  }
  return articleIds;
}

/**
 * Given a Set of numbers representing article IDs of clicked articles,
 * save to the articleIds cookie
 *
 * @param {Set} articleIds - Set of article IDs
 */
export function saveArticleIdsToCookie(articleIds) {
  let ids = []
  for (let val of articleIds) {
    if (isNaN(val)) continue;
    ids.push(val);
  }

  let cookieVal = ids.join(',');
  Cookies.set(ARTICLEID_COOKIE, cookieVal);
}


export function sortTopArticles(articles=[], state) {
  if (!articles.length) return [];

  let sectionState = {};
  for (let section of state.sections) sectionState[section.name] = section.showArticles;

  let topArticles = [];
  for (let article of articles) {
    let addArticle = true;
    for (let section of article.sections) {
      if (section in sectionState && !sectionState[section]) {
        addArticle = false;
        break;
      }
    }
    if (addArticle) topArticles.push(article);
  }

  return topArticles.slice(0, 25);
}

export function gotTopArticles(articles=[]) {
  return {
    type: GOT_TOP_ARTICLES,
    value: articles
  }
}

export function gotQuickstats(quickstats=[]) {
  return {
    type: GOT_QUICKSTATS,
    value: quickstats
  }
}

export function toggleInfo() {
  return {
    type: TOGGLE_INFO
  }
}

export const DEFAULT_ARTICLE_LIST = {
  topArticles: [],
  allArticles: [],
  totalReaders: 0,
  clickedArticles: new Set(getArticleIdsFromCookie()),
  showInfo: false
}
