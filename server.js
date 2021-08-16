const express = require('express');
const MongoClient = require('mongodb').MongoClient;

const dburl = "mongodb+srv://h0ch1:a02070203@nodetest.kijps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine' , 'ejs');
app.use('/public', express.static('public'));

var db
MongoClient.connect(dburl, (err, client) => {
    if(err) return console.log(err);

    db = client.db('armydate');

    app.listen(8080, () => {
        console.log('server start');
    });
});

app.get('/', (req, res) => {
    res.render('login.ejs');
})

app.get('/soldier', (req, res) => {
    res.render('index.ejs');
})

app.get('/signup', (req, res) => {
    res.render('signup.ejs');
})

app.get('/cal', (req, res) => {
    
})

