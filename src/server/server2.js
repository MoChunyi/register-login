var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.listen(3002, function(){
    console.log('server running on port: 3002');
});

app.get('/index', function(req,res){
    res.sendFile(__dirname+ '/index.html');
});

app.post('/userinfo', function(req,res){
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000/register');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.send([
    {
      id: 0,
      title: 'Lorem ipsum',
      content: 'Dolor sit amet',
      author: 'Marcin'
    },
    {
      id: 1,
      title: 'Vestibulum cursus',
      content: 'Dante ut sapien mattis',
      author: 'Marcin'
    }
  ]);
});