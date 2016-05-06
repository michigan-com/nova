'use strict';

import { combineReducers, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducers from './reducers';

const Reducers = combineReducers(reducers);
const Store = createStore(Reducers, applyMiddleware(thunk));

export default Store;
