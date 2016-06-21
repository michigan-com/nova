'use strict';

import { DEFAULT_STATE, ARTICLES_FETCHED } from '../../actions/articles';

export default function reducer(state = DEFAULT_STATE, action) {
  let articles;
  switch (action.type) {
    case ARTICLES_FETCHED:
      articles = action.value;
      return { ...state, articles };
    default:
      return { ...state };
  }
}
