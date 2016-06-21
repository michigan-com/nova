'use strict';

import { combineReducers } from 'redux';

import User from '../../../common/reducers/user';
import PhoneNumber from './phone-number';
import BreakingNews from './breaking-news';

export default combineReducers({ User, PhoneNumber, BreakingNews });
