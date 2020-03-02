//bring createStore and apply middleware from redux
import {
    createStore,
    applyMiddleware
} from 'redux';
import {
    composeWithDevTools
} from 'redux-devtools-extension';
//the middleware
import thunk from 'redux-thunk';
import rootReducer from './reducers';

const initialState = {};

const middleware = [thunk];

const store = createStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
);

export default store;