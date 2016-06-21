'use strict';

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import Reducers from './reducers';

const Store = createStore(Reducers, applyMiddleware(thunk));

export const DEFAULT_STATE = Store.getState();

export default Store;
