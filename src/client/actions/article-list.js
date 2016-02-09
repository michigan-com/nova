'use strict';

import React from 'react';
import Cookies from 'cookies-js';

import { getRandomInt } from '../lib/random';
import { appName } from '../../../config';

export const GOT_TOP_ARTICLES = 'GOT_TOP_ARTICLES';
export const GOT_QUICKSTATS = 'GOT_QUICKSTATS';
export const TOGGLE_INFO = 'TOGGLE_INFO';

export const INFO_BLURBS = [
  <div>{ `Using ${appName}'s Speed Reader, you can read an entire article in a fraction of the time! `}</div>,
  <div>On an iPhone? Save our site to your home screen using the <img src='/img/share-button.svg'/> button</div>,
  <div>Our bots love nothing more than working all day summarizing articles for you</div>,
  <div>Did you hear that one story about that one guy? So crazy.</div>,
  <div>Fun fact: Rabbits move much slower than our Speed Reader, but it's the closest comparison we could come up with</div>,
  <div>Out of articles? Don't worry! This list updates every 10 seconds, check back for more later!</div>,
  <div>News updates for you, as fast as you can handle it</div>,
  <div>Speed Reading tip: Try not reading the words out loud in your head, it'll help!</div>,
  <div>Max Speed Reading speed is 1000 WPM, can you go faster than that?</div>,
  <div>Filters at the bottom of the page eliminate articles you might not want to read</div>
];

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
  showInfo: false,
  infoBlurbs: INFO_BLURBS,
  blurbIndex: getRandomInt(0, INFO_BLURBS.length - 1)
}
