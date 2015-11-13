'use strict';

import { EventEmitter } from 'events';
import assign from 'object-assign';
import xr from 'xr';

import Dispatcher from '../dispatcher';

var ARTICLE_CHANGE = 'article-change';

function getArticleActions() {
  return {
    gotArticles: 'got-topArticles',
    gotQuickstats: 'got-quickstats',
    articleSelected: 'article-selected',
  }
}

function defaultArticleStore() {
  return {
    // Article list
    topArticles: [],
    readers: -1,

    // Active article stuff
    activeArticle: null,
    activeArticleReaders: 0,
    clickedArticles: new Map(),

    // State management, might want this somewhere else
    articleLoading: false,
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

    // sort by visits desc then sort by title asc
    topArticles.sort(function(a, b) {
      var visitsA = parseInt(a.visits);
      var visitsB = parseInt(b.visits);

      if (visitsA == visitsB) {
        return a.headline.localeCompare(b.headline);
      }
      return visitsB - visitsA;
    });

    let filteredArticles = [];
    for (let article of topArticles) {
      // Update the active article if we have one
      if (!store.articleLoading && store.activeArticle && store.activeArticle.article_id) {
        if (article.article_id === store.activeArticle.article_id) {
          store.activeArticleReaders = article.visits;
          break;
        }
      }
    }

    store.topArticles = topArticles.slice(0, 25);
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

  updateActiveArticle(articleId) {
    // Dont update an active article if we're on an active article
    if (store.activeArticle != null || store.articleLoading) return;

    if (articleId in articleCache) {
      // TODO set some cache threshold. Maybe a cache entry is stale after 24 hours?
      document.body.className = document.body.className += ' article-open';
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
    document.body.className = document.body.className.replace('article-open', '');
    store.activeArticle = null;
    store.articleLoading = false;
    this.emitChange();
  },

  /** Mapi interactions */
  fetchActiveArticle(articleId) {
    xr.get(`https://api.michigan.com/v1/article/${articleId}/`)
      .then((data) => {
        document.body.className = document.body.className += ' article-open';
        articleCache[articleId] = data;
        store.activeArticle = data;
        store.articleLoading = false;
        this.emitChange();
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
      Store.updateActiveArticle(action.article_id);
      break;
    case ArticleActions.closeActiveArticle:
      Store.closeActiveArticle();
      break;
  }
});

module.exports = { Store, ArticleActions, defaultArticleStore }
