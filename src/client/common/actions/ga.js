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
export function gaEvent(eventData = {}) {
  if (typeof window.ga === 'undefined') return;

  // Make sure that an "event" gets sent
  const payload = assign({}, eventData, { hitType: 'event' });
  window.ga('send', payload);
}

export function gaPageView(eventData = {}) {
  if (typeof window.ga === 'undefined') return;
  window.ga('send', eventData);
}
