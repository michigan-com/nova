'use strict';

import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import { enableBatching } from 'redux-batched-actions';

import Reducers from './reducers';

const Store = createStore(enableBatching(Reducers), applyMiddleware(thunk));

export const DEFAULT_STATE = Store.getState();

export default Store;
