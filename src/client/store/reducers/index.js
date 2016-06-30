'use strict';

import { combineReducers } from 'redux';

import ActiveArticle from './active-article';
import User from './user';
import Signup from './signup';
import ArticleList from './article-list';
import PhoneNumber from './phone-number';
import BreakingNews from './breaking-news';
import Nav from './nav';
import StreamArticles from './stream-articles';

export default combineReducers({
  ActiveArticle,
  ArticleList,
  PhoneNumber,
  User,
  Signup,
  BreakingNews,
  Nav,
  StreamArticles,
});
