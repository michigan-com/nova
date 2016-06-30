'use strict';

import { GOT_TOP_ARTICLES, GOT_QUICKSTATS, DEFAULT_ARTICLE_LIST, TOGGLE_INFO,
  sortTopArticles, saveArticleIdsToCookie } from '../../actions/article-list';
import { DEFAULT_SECTIONS, SECTION_SELECT, writeSectionCookie } from '../../actions/filters';
import { ARTICLE_LOADED, CLOSE_ACTIVE_ARTICLE, getActiveArticleReaders,
  } from '../../actions/active-article';
import { getRandomInt } from '../../util/random';

const DEFAULT_STATE = { ...DEFAULT_ARTICLE_LIST, ...DEFAULT_SECTIONS };

export default function (state = DEFAULT_STATE, action) {
  let topArticles = [];
  let allArticles;
  let totalReaders;
  let quickstats;
  let sectionName;
  let sections;
  let newState;
  let activeArticle;
  let clickedArticles;
  let showInfo;
  let blurbIndex;
  let articles;
  let activeArticleReaders;

  switch (action.type) {
    case GOT_TOP_ARTICLES:
      allArticles = action.value;
      topArticles = sortTopArticles(allArticles, state);

      newState = { ...state, topArticles, allArticles };

      articles = action.value;
      activeArticleReaders = getActiveArticleReaders(articles, state);
      if (activeArticleReaders >= 0) {
        newState.activeArticleReaders = activeArticleReaders;
      }
      return newState;
    case GOT_QUICKSTATS:
      totalReaders = 0;
      quickstats = action.value;
      for (const site of quickstats) totalReaders += site.visits;
      return { ...state, totalReaders };
    case SECTION_SELECT:
      sectionName = action.value;
      sections = state.sections.slice(0);
      for (const section of sections) {
        if (section.name === sectionName) section.showArticles = !section.showArticles;
      }
      writeSectionCookie(sections);

      newState = { ...state, sections };
      topArticles = sortTopArticles(state.allArticles, newState);
      return { ...newState, topArticles };
    case ARTICLE_LOADED:
      activeArticle = action.value;
      clickedArticles = new Set(state.clickedArticles);
      clickedArticles.add(activeArticle.article_id);
      saveArticleIdsToCookie(clickedArticles);
      return { ...state, clickedArticles };
    case TOGGLE_INFO:
      showInfo = !state.showInfo;
      return { ...state, showInfo };
    case CLOSE_ACTIVE_ARTICLE:
      blurbIndex = getRandomInt(0, state.infoBlurbs.length - 1);
      return { ...state, blurbIndex };
    default:
      return { ...state };
  }
}
