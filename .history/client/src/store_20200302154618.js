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
//to combine all the reducers in the root reducer
//from index.js from reducers folder
import rootReducer from './reducers';

//asign it to empty object
//all of the initial state will be in the reducers
const initialState = {};

const middleware = [thunk];

//creating the store
const store = createStore(
    rootReducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
);

export default store;