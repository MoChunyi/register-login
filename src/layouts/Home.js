import React from 'react';
import { Link } from 'react-router-dom';
import Container from '@material-ui/core/Container';
import Register from '../components/Register';
import Routes from '../routes/Routes';
const Home = () => {
    return (
        <Container>
            <Container>
                <Routes></Routes>
            </Container>
        </Container>
    )
}

export default Home;