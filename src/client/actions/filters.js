'use strict';

import Cookies from 'cookies-js';

import { gaEvent } from './ga';

export const SECTION_SELECT = 'SECTION_SELECT';

export const SPORTS = 'sports';
export const BUSINESS = 'business';
export const LOCAL = 'local';
export const SECTION_OPTIONS = [SPORTS, BUSINESS, LOCAL];

const SECTION_FILTER_GA_EVENT_CATEGORY = 'sectionFilter';

const SECTION_COOKIE = 'sections';

export function writeSectionCookie(sectionState) {
  Cookies.set(SECTION_COOKIE, JSON.stringify(sectionState), { expires: Infinity });
}

function defaultSections() {
  const sectionsCookie = Cookies.get(SECTION_COOKIE) || undefined;

  try {
    return JSON.parse(sectionsCookie);
  } catch (e) {
    console.log('Failed to parse section cookie, setting default');
  }

  const sections = [];
  for (const name of SECTION_OPTIONS) {
    let displayName;
    switch (name) {
      case LOCAL:
        displayName = 'news';
        break;
      default:
        displayName = name;
    }

    sections.push({
      name,
      displayName,
      showArticles: true,
    });
  }
  writeSectionCookie(sections);
  return sections;
}


/**
 * Action to take when a section filter is clicked
 *
 * @param {String} sectionName - Section in question
 * @param {Boolean} previousState - Current filter state. The filter's new state
 *  will be !previousState
 */
export function sectionSelect(sectionName = '', previousState = false) {
  const newState = !previousState;
  gaEvent({
    eventCategory: SECTION_FILTER_GA_EVENT_CATEGORY,
    eventAction: newState ? 'show' : 'hide',
    eventLabel: sectionName,
  });
  return {
    type: SECTION_SELECT,
    value: sectionName,
  };
}

export const DEFAULT_SECTIONS = {
  sections: defaultSections(),
};
