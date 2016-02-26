'use strict';

import Cookies from 'cookies-js';

import { gaEvent } from './ga';

export const SECTION_SELECT = 'SECTION_SELECT';

export const SPORTS = 'sports';
export const BUSINESS = 'business';
export const LOCAL = 'local';
export const SECTION_OPTIONS = [SPORTS, BUSINESS, LOCAL];

const SECTION_FILTER_GA_EVENT_CATEGORY = 'sectionFilter';

var SECTION_COOKIE = 'sections';

function defaultSections() {
  let sectionsCookie = Cookies.get(SECTION_COOKIE) || undefined;

  try {
    return JSON.parse(sectionsCookie);
  } catch(e) {
    console.log(`Failed to parse section cookie, setting default`);
  }

  let sections = [];
  for (let name of SECTION_OPTIONS) {
    let displayName = name;
    switch (name) {
      case LOCAL:
        displayName = 'news';
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

export function writeSectionCookie(sectionState=DEFAULT_SECTIONS) {
  Cookies.set(SECTION_COOKIE, JSON.stringify(sectionState));
}

/**
 * Action to take when a section filter is clicked
 *
 * @param {String} sectionName - Section in question
 * @param {Boolean} previousState - Current filter state. The filter's new state
 *  will be !previousState
 */
export function sectionSelect(sectionName='', previousState=false) {
  let newState = !previousState;
  gaEvent({
    eventCategory: SECTION_FILTER_GA_EVENT_CATEGORY,
    eventAction: newState ? 'show' : 'hide',
    eventLabel: sectionName
  });
  return {
    type: SECTION_SELECT,
    value: sectionName
  }
}

export const DEFAULT_SECTIONS = {
  sections: defaultSections()
}
