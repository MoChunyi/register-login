import React, {} from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from 'react-router-dom';
import Home from './layouts/Home';
const App = () => {
    return (
        <Router>
            <Home/>
        </Router>  
    )
}

ReactDOM.render(<App/>, document.getElementById('root'));