'use strict';

import { DEFAULT_STATE, VIEW_CHANGE } from '../../actions/nav';

export default function reducer(state = DEFAULT_STATE, action) {
  let { currentView } = state;
  switch (action.type) {
    case VIEW_CHANGE:
      currentView = action.value;
      return { ...state, currentView };
    default:
      return { ...state };
  }
}
