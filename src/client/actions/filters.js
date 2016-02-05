'use strict';

import Cookies from 'cookies-js';

export const SECTION_SELECT = 'SECTION_SELECT';

export const SPORTS = 'sports';
export const BUSINESS = 'business';
export const LOCAL = 'local';
export const SECTION_OPTIONS = [SPORTS, BUSINESS, LOCAL];

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

  return sections;
}

export function sectionSelect(sectionName='') {
  return {
    type: SECTION_SELECT,
    value: sectionName
  }
}

export const DEFAULT_SECTIONS = {
  sections: defaultSections()
}
