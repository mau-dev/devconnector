import React, { Fragment } from 'react';
import Navbar from './components/layout/Navbar';

import Landing from './components/layout/Landing';

import './App.css';

const App = () =>
    //ghost element that won't show in the dom
    <Fragment >
     <Navbar />
     <Landing />
    </Fragment>

export default App;