'use strict';

import { ARTICLE_SELECTED, ARTICLE_LOADED, START_SPEED_READING,
  STOP_SPEED_READING, CLOSE_ACTIVE_ARTICLE, DEFAULT_ARTICLE, ARTICLE_LOAD_FAILED,
} from '../../actions/active-article';

export default function (state = DEFAULT_ARTICLE, action) {
  let articleLoading;
  let activeArticle;
  let speedReading;
  let activeArticleReaders;
  switch (action.type) {
    case ARTICLE_SELECTED:
      activeArticleReaders = action.value;
      articleLoading = true;
      return { ...state, activeArticleReaders, articleLoading };
    case ARTICLE_LOADED:
      activeArticle = action.value;
      articleLoading = false;
      return { ...state, activeArticle, articleLoading };
    case ARTICLE_LOAD_FAILED:
    case CLOSE_ACTIVE_ARTICLE:
      articleLoading = false;
      activeArticle = null;
      speedReading = false;
      return { ...state, articleLoading, activeArticle, speedReading };
    case START_SPEED_READING:
      speedReading = true;
      return { ...state, speedReading };
    case STOP_SPEED_READING:
      speedReading = false;
      return { ...state, speedReading };
    default:
      return { ...state };
  }
}
