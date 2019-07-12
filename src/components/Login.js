import React, {useState} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import security from '../utils/security';
import checkemailimage from '../assets/imags/totoro.jpg'
const useStyles = makeStyles(theme => ({
    card: {
        width: '300px',
        position: 'relative',
        left: '50%',
        top: '50px',
        transform: 'translate(-50%)'
    },
    textField: {
        display: 'flex',
        margin: theme.spacing(1),
    },
    submitButton: {
        margin: theme.spacing(1),
    },
    cardContent: {
        padding: theme.spacing(1),
       
    },
    cardActions: {
        flexDirection: 'row-reverse'
    }
}))
const Login = () => {
    const [email, setEmail] = useState('mcyatom@gmail.com');
    const [password, setPassword] = useState('123456');
    const classes = useStyles();
    const startLogin = () => {
        security.login.startLogin(email, password)
    }
    return (
        <Card className={classes.card}>
            <CardMedia
                component="img"
                alt="Contemplative Reptile"
                height="140"
                image={checkemailimage}
                title="Contemplative Reptile"
            />
            <CardContent className={classes.cardContent}>
                <form>
                    <TextField
                        label="Email"
                        className={classes.textField}
                        value={email}
                        type="email"
                        name="email"
                        autoComplete="email"
                        margin="normal"
                        onChange={(event) => {setEmail(event.target.value)}}
                    />
                    <TextField
                        label="Password"
                        className={classes.textField}
                        value={password}
                        type="password"
                        autoComplete="current-password"
                        margin="normal"
                        onChange={(event) => {setPassword(event.target.value)}}
                    />
                </form>
            </CardContent>
            <CardActions className={classes.cardActions}>
                <Button 
                    variant="contained" 
                    color="primary" 
                    className={classes.submitButton}
                    onClick={startLogin}
                >
                    登录
                </Button>
            </CardActions>
        </Card>
    )
}

export default Login;