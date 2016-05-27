'use strict';

import assign from 'object-assign';

/**
 * Trigger a Google Analytics event
 * https://developers.google.com/analytics/devguides/collection/analyticsjs/events
 *
 * @param {Object} eventData - Extra data to be passed to Google Analytics 'send'
 *    command. For possible values, see:
 *
 *    https://developers.google.com/analytics/devguides/collection/analyticsjs/events#event_fields
 */
export function gaEvent(eventData={}) {
  if (typeof ga === "undefined") return;
  
  // Make sure that an "event" gets sent
  let payload = assign({}, eventData, { hitType: 'event' });
  console.log(payload);
  ga('send', payload);
}

export function gaPageView(page, title) {
  if (typeof ga === "undefined") return;

  let eventData = { page, title };
  let payload = assign({}, eventData, { hitType: 'pageview' } );
  console.log(payload);
  ga('send', payload);
}
