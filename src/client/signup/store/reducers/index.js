'use strict';

import { combineReducers } from 'redux';

import User from '../../../common/reducers/user';
import PhoneNumber from './phone-number';
import BreakingNews from './breaking-news';
import Code from './code';

export default combineReducers({ User, PhoneNumber, BreakingNews, Code });
