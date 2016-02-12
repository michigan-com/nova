'use strict';

import assign from 'object-assign';

import { GOT_TOP_ARTICLES, GOT_QUICKSTATS, DEFAULT_ARTICLE_LIST, TOGGLE_INFO,
  sortTopArticles, saveArticleIdsToCookie } from '../../actions/article-list';
import { DEFAULT_SECTIONS, SECTION_SELECT, writeSectionCookie} from '../../actions/filters';
import { ARTICLE_LOADED, CLOSE_ACTIVE_ARTICLE } from '../../actions/active-article';
import { getRandomInt } from '../../lib/random';

const DEFAULT_STATE = assign({}, DEFAULT_ARTICLE_LIST, DEFAULT_SECTIONS);

export default function(state=DEFAULT_STATE, action) {
  let topArticles = []
  switch (action.type) {
    case GOT_TOP_ARTICLES:
      let allArticles = action.value;
      topArticles = sortTopArticles(allArticles, state);
      return assign({}, state, { topArticles, allArticles });
    case GOT_QUICKSTATS:
      let totalReaders = 0;
      let quickstats = action.value;
      for (let site of quickstats) totalReaders += site.visits;
      return assign({}, state, { totalReaders });
    case SECTION_SELECT:
      let sectionName = action.value;
      let sections = state.sections.slice(0);
      for (let section of sections) {
        if (section.name === sectionName) section.showArticles = !section.showArticles;
      }
      writeSectionCookie(sections);

      let newState = assign({}, state, { sections });
      topArticles = sortTopArticles(state.allArticles, newState);
      return assign({}, newState, { topArticles });
    case ARTICLE_LOADED:
      let activeArticle = action.value;
      let clickedArticles = new Set(state.clickedArticles);
      clickedArticles.add(activeArticle.article_id)
      saveArticleIdsToCookie(clickedArticles);
      return assign({}, state, { clickedArticles });
    case TOGGLE_INFO:
      let showInfo = !state.showInfo;
      return assign({}, state, { showInfo });
    case CLOSE_ACTIVE_ARTICLE:
      let blurbIndex = getRandomInt(0, state.infoBlurbs.length - 1);
      return assign({}, state, { blurbIndex });

  }
  return state;
}
