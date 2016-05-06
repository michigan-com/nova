'use strict';

import assign from 'object-assign';

import { DEFAULT_ARTICLE_LIST } from './article-list';
import { DEFAULT_FILTERS } from './filters';

export const DEFAULT_STATE = assign({}, DEFAULT_ARTICLE, DEFAULT_ARTICLE_LIST,
  DEFAULT_FILTERS);
