'use strict';

export const VIEW_CHANGE = 'VIEW_CHANGE';

export const TOP_ARTICLES = 'TOP_ARTICLES';
export const STREAM_ARTICLES = 'STREAM_ARTICLES';

export function changeView(view = TOP_ARTICLES) {
  if (view !== TOP_ARTICLES && view !== STREAM_ARTICLES) return {};

  return {
    type: VIEW_CHANGE,
    value: view,
  };
}

export const DEFAULT_STATE = {
  currentView: TOP_ARTICLES,
};
