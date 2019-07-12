import React, {} from 'react';
import {makeStyles} from '@material-ui/core/styles'
import Card from '@material-ui/core/Card';
import CardActionArea from '@material-ui/core/CardActionArea';
import CardMedia from '@material-ui/core/CardMedia';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import Typography from '@material-ui/core/Typography';
import checkemailimage from '../assets/imags/totoro.jpg';
const useStyles = makeStyles(theme => ({
    card: {
        width: '400px',
        position: 'relative',
        left: '50%',
        transform: 'translate(-50%)'
    },
    cardActions: {
        padding: theme.spacing(2),
        flexDirection: 'row-reverse'
    },
    checkBtn: {
        position: 'relative',
        right:'0px'
    }
}))

const CheckEmail = () => {
    const classes = useStyles();
    const handleCheckEmail = () => {
        var url = window.location.toString();
        console.log(url);
        var confirm = url.split('#')[1];
        console.log(confirm)
        fetch(`http://localhost:3001/checkemail#${confirm}`,
            {
                method: 'POST',
                body: JSON.stringify({confirm: confirm}),
                mode: 'cors',
                headers: {
                    'Content-type': 'application/json',
                }
            }
        ).then(response => {
            return response.json();
        }).then(data => {
            console.log(data)
            if (data.code === 200) {
                window.location='http://localhost:3000/login'
            }
        })
    }
    return (
        <div>
            <Card className={classes.card}>
                <CardActionArea>
                    <CardMedia
                        component="img"
                        alt="Contemplative Reptile"
                        height="140"
                        image={checkemailimage}
                        title="Contemplative Reptile"
                    />
                    <CardContent>
                        <Typography gutterBottom variant="h5" component="h2">
                            GHIBLI
                        </Typography>
                        <Typography variant="body2" color="textSecondary" component="p">
                            来了，老弟！
                        </Typography>
                    </CardContent>
                </CardActionArea>
                <CardActions className={classes.cardActions}>
                    <Button size="small" variant="contained" color="primary" className={classes.checkBtn}
                        onClick={handleCheckEmail}
                    >
                        确认
                    </Button>
                </CardActions>
            </Card>
        </div>
    )
}

export default CheckEmail;