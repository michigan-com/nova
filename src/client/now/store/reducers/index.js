'use strict';

import { combineReducers } from 'redux';

import ActiveArticle from '../../../common/reducers/active-article';
import User from '../../../common/reducers/user';
import Signup from '../../../common/reducers/signup';
import ArticleList from './article-list';
import PhoneNumber from './phone-number';

export default combineReducers({
  ActiveArticle,
  ArticleList,
  PhoneNumber,
  User,
  Signup,
});
