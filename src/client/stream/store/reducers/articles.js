'use strict';

import { DEFAULT_STATE, ARTICLES_FETCHED } from '../../actions/articles';

export default function articles(state=DEFAULT_STATE, action) {
  switch (action.type) {
    case ARTICLES_FETCHED:
      let articles = action.value;
      return { ...state, articles }
  }

  return { ...state }
}
