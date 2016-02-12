'use strict';

import assign from 'object-assign';

export const ARTICLE_SELECTED_EVENT = 'articleSelected';
export const ARTICLE_LOADED_EVENT = 'articleLoaded';
export const ARTICLE_LOAD_FAILED_EVENT = 'articleLoadFailed';
export const ARTICLE_CLOSED_EVENT = 'articleClosed';

export const SECTION_TOGGLE_EVENT = 'sectionToggle';


/**
 * Trigger a Google Tag Manager event
 *
 * @param {String} event - name of event being triggered
 * @param {Object} eventData - Extra data to be passed to Google
 */
export function googleTagEvent(event, eventData={}) {
  let eventObj = assign({}, eventData, { event })
  console.log('google tag event');
  console.log(eventObj);
  dataLayer.push(eventObj);
  return;
}
