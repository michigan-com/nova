'use strict';

import { combineReducers } from 'redux';

import ActiveArticle from '../../../common/reducers/active-article';
import ArticleList from './article-list';
import PhoneNumber from './phone-number';

export default combineReducers({ ActiveArticle, ArticleList, PhoneNumber });
