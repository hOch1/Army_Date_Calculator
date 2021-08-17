const express = require('express');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const LocalStrategy = require('passport-local');
const session = require('express-session');

const dburl = "mongodb+srv://h0ch1:a02070203@nodetest.kijps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

const app = express();
app.use(express.urlencoded({extended: true}));
app.set('view engine' , 'ejs');
app.use('/public', express.static('public'));
app.use(session({secret : '비밀코드', resave : true, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

var db
MongoClient.connect(dburl, (err, client) => {
    if(err) return console.log(err);

    db = client.db('armydate');

    app.listen(8080, () => {
        console.log('server start');
    });
});

app.get('/', (req, res) => {
    res.render('index.ejs');
})

app.get('/signin', (req, res) => {
    res.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {failureRedirect : '/fail'}), (req, res) =>{
    res.redirect('/');
})

app.get('/mypage', login, (req, res) => {
    res.render('mypage.ejs', {});
})

function login(req, res, next) {
    if (req.user) {
      next();
    } else {
        res.redirect('/fail');
    }
}

app.get('/fail', (req, res) => {
    res.render('fail.ejs');
})

app.get('/signup', (req, res) => {
    res.render('signup.ejs');
})

app.get('/cal', (req, res) => {
    res.render('cal.ejs');
})

//  passport
passport.use(new LocalStrategy({
    usernameField: 'id',
    passwordField: 'pw',
    session: true,
    passReqToCallback: false,
  }, function (id, pw, done) {
    db.collection('users').findOne({ id: id }, function (err, result) {
      if (err) return done(err)
  
      if (!result) return done(null, false, { message: '존재하지않는 아이디요' })
      if (pw == result.pw) {
        return done(null, result)
      } else {
        return done(null, false, { message: '비번틀렸어요' })
      }
    })
  }));
//  session 생성
  passport.serializeUser(function (user, done) {
    done(null, user.id)
  });
  
  passport.deserializeUser(function (id, done) {
      db.collection('users').findOne({ id: id}, (err, result) => {
              done(null, {});
      })
  }); 

