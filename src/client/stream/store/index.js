'use strict';

import { combineReducers, createStore } from 'redux';

import reducers from './reducers';

const Reducers = combineReducers(reducers);
const Store = createStore(Reducers);

export default Store;
