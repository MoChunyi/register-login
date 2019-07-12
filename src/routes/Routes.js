import React from 'react';
import {Switch, Route} from 'react-router-dom';
import Register from '../components/Register';
import CheckEmail from '../components/CheckEmail';
import Login from '../components/Login'
const Routes = () => {
    return (
        <Switch>
            <Route exact path="/" component={Register}/>
            <Route exact path="/register" component={Register}/>
            <Route exact path='/checkemail' component={CheckEmail}/>
            <Route exact path='/login' component={Login}/>
        </Switch>
    )
}

export default Routes;