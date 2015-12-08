'use strict';

import url from 'url';
import { EventEmitter } from 'events';
import assign from 'object-assign';
import xr from 'xr';

import Config from '../../../config';
import Dispatcher from '../dispatcher';

/** Browser history stuff */
require('historyjs/scripts/bundled/html4+html5/native.history.js');
window.onpopstate = (e) => {
  Store.historyChange(e);
}

var ARTICLE_CHANGE = 'article-change';


function getArticleActions() {
  return {
    gotArticles: 'got-topArticles',
    gotQuickstats: 'got-quickstats',
    articleSelected: 'article-selected',
    sectionSelect: 'section-select',
    startSpeedReading: 'start-speed-reading',
    stopSpeedReading: 'stop-speed-reading'
  }
}

function defaultArticleStore() {
  return {
    // Article list
    allArticles: [],
    topArticles: [],
    readers: -1,

    // Active article stuff
    activeArticle: null,
    activeArticleReaders: 0,
    clickedArticles: new Map(),
    speedReading: false,

    // State management, might want this somewhere else
    articleLoading: false,

    // Sections
    sections: [{
      name: 'sports',
      showArticles: true
    }, {
      name: 'business',
      showArticles: true
    }, {
      name: 'local',
      showArticles: true
    }]
  }
}

var store =  defaultArticleStore();
var articleCache = {};
var ArticleActions = getArticleActions()

var Store = assign({}, EventEmitter.prototype, {
  /** Register stuff */
  addChangeListener(callback) { this.on(ARTICLE_CHANGE, callback); },
  removeChangeListener(callback) { this.off(ARTICLE_CHANGE, callback); },

  /** Emit stuff */
  emitChange() { this.emit(ARTICLE_CHANGE, assign({}, store)); },

  /** Update functions */
  updateArticles(topArticles) {

    let sectionState = {};
    for (let section of store.sections) {
      sectionState[section.name] = section.showArticles;
    }

    // sort by visits desc then sort by title asc
    topArticles.sort(function(a, b) {
      var visitsA = parseInt(a.visits);
      var visitsB = parseInt(b.visits);

      if (visitsA == visitsB) {
        return a.headline.localeCompare(b.headline);
      }
      return visitsB - visitsA;
    });


    // Iterate over articles
    let filteredArticles = [];
    for (let article of topArticles) {
      // Update the active article if we have one
      if (!store.articleLoading && !!store.activeArticle) {
        if (article.article_id === store.activeArticle.article_id && article.source === store.activeArticle.source) {
          store.activeArticleReaders = article.visits;
        }
      }

      // Look at the sections, see if we want to filter it out
      let addArticle = true;
      for (let section of article.sections) {
        if (section in sectionState && ! sectionState[section]) {
          addArticle = false;
          break;
        }
      }

      if (addArticle) filteredArticles.push(article);
    }

    // Now store stuff
    store.topArticles = filteredArticles.slice(0, 25);
    store.allArticles = topArticles;
    this.emitChange();
  },

  updateQuickstats(quickstats) {
    let totalReaders = 0;
    for (let site of quickstats) {
      totalReaders += site.visits;
    }

   store.readers = totalReaders;
   this.emitChange();
  },

  updateActiveArticle(articleId, readers=0) {
    // Dont update an active article if we're on an active article
    if (store.activeArticle != null || store.articleLoading) return;

    store.activeArticleReaders = readers;

    if (articleId in articleCache) {
      // TODO set some cache threshold. Maybe a cache entry is stale after 24 hours?
      History.pushState({ articleId }, `Article ${articleId}`, `?articleId=${articleId}`);
      store.activeArticle = articleCache[articleId];
      this.emitChange();
      return;
    }

    store.articleLoading = true;
    store.clickedArticles.get(articleId, true);
    this.emitChange();

    this.fetchActiveArticle(articleId);
  },

  closeActiveArticle() {
    store.activeArticle = null;
    store.articleLoading = false;
    store.speedReading = false;
    History.pushState({}, 'Top Articles', '/');
    this.emitChange();
  },

  setSpeedReading(state) {
    store.speedReading = state;
    this.emitChange();
  },

  sectionSelect(sectionName) {
    for (let section of store.sections) {
      if (section.name != sectionName) continue;
      section.showArticles = !section.showArticles;
    }

    this.updateArticles(store.allArticles);
  },

  historyChange(e) {
    let state = History.getState();
    let stateTitle = state.title;

    let articleIdMatch = /Article\s+(\d+)/.exec(stateTitle);

    // We were on a page and now we're going back
    if (articleIdMatch) {
      this.closeActiveArticle();
    }
  },

  /** Mapi interactions */
  fetchActiveArticle(articleId) {
    xr.get(`${Config.socketUrl}/v1/article/${articleId}/`)
      .then((data) => {
        articleCache[articleId] = data;
        store.activeArticle = data;
        store.articleLoading = false;

        History.pushState({ articleId }, `Article ${articleId}`, `?articleId=${articleId}`);
        this.emitChange();
      }, (e) => {
      console.log(`Failed to fetch article https://api.michigan.com/v1/article/${articleId}/`);
      this.closeActiveArticle();
    });
  }

});

Dispatcher.register(function(action) {
  switch(action.type) {
    case ArticleActions.gotArticles:
      Store.updateArticles(action.articles);
      break;
    case ArticleActions.gotQuickstats:
      Store.updateQuickstats(action.quickstats);
      break;
    case ArticleActions.articleSelected:
      Store.updateActiveArticle(action.article_id, action.readers);
      break;
    case ArticleActions.closeActiveArticle:
      Store.closeActiveArticle();
      break;
    case ArticleActions.sectionSelect:
      Store.sectionSelect(action.sectionName);
      break;
    case ArticleActions.startSpeedReading:
      Store.setSpeedReading(true);
      break;
    case ArticleActions.stopSpeedReading:
      Store.setSpeedReading(false);
      break;
  }
});

// See if we have an ?articleId= url param
let parsed = url.parse(window.location.href, true);
if (parsed.query && 'articleId' in parsed.query && !isNaN(parsed.query.articleId)) {
    Store.updateActiveArticle(parseInt(parsed.query.articleId));
}

module.exports = { Store, ArticleActions, defaultArticleStore, getArticleActions }
