import React, { Fragment } from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
//Redux
//to use the state from redux, import provider, to combine react with
//to use the provider, wrap all components in the provider, so all of them can access the uplevel state
//pass the store in the provider
import { Provider }  from 'react-redux';
//bring the store
import store from './store';


import './App.css';

const App = () =>
    <Provider store={store}>
        <Router>
            {/*ghost element that won't show in the dom*/}
            <Fragment >
                 <Navbar />
                  {/*//check for root route to render the landing component*/}
                 <Route exact path='/' component={Landing} />
                 <section className="container">
                 <Switch>
                <Route exact path='/register' component={Register} />
                <Route exact path='/login' component={Login} />
              </Switch>
            </section>
            </Fragment>
         </Router>
    </Provider>
export default App;