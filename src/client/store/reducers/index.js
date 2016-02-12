'use strict';

import { combineReducers } from 'redux';

import ActiveArticle from './active-article';
import ArticleList from './article-list';

export default combineReducers({ ActiveArticle, ArticleList});
