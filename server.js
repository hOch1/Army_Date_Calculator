const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const app = express();

const dburl = "mongodb+srv://h0ch1:a02070203@nodetest.kijps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

app.use(express.urlencoded({extended: true}));
app.set('view engine' , 'ejs');
app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(
  session({
    secret : '12312dajfj23rj2po4$#%@#', 
    resave : true, 
    saveUninitialized : false,
    store : MongoStore.create({
      mongoUrl : dburl
    })
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());


// db연결 & 서버 실행
var db
MongoClient.connect(dburl, (err, client) => {
    if(err) return console.log(err);

    db = client.db('armydate');

    app.listen(8080, () => {
        console.log('server start');
    })
});

// index 페이지
app.get('/', (req, res) => {
    res.render('index.ejs');
})

// 로그인
app.get('/signin', (req, res) => {
    res.render('login.ejs');
})

app.post('/login', passport.authenticate('local', {failureRedirect : '/auth'}),
    (req, res) => {
      res.redirect('/');
    }
);

// 로그아웃
app.get('/logout', async (req, res) => {
    try {
      if(req.session) {
        req.session.destroy();
      }
      res.redirect(req.headers.referer);
    } catch (err) {
      res.redirect(req.headers.referer);
    }
})

// 회원가입
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
})

// 전역일 계산
app.get('/cal', (req, res) => {
    res.render('cal.ejs');
})

app.post('/result', (req, res) => {
  var start = req.body.start;
  var end = req.body.end;
  start = start.split('-');
  end = end.split('-');
  var now = new Date();
  var ny = now.getFullYear();
  var nm = now.getMonth()+1;
  var nd = now.getDate();

  var nowdate = new Date(ny,nm,nd);
  var stdate = new Date(start[0],start[1],start[2]);
  var eddate = new Date(end[0],end[1],end[2]);

  var nowMs = nowdate.getTime() - stdate.getTime();
  var nowDay = nowMs / (1000*60*60*24);

  var totalMs = eddate.getTime() - stdate.getTime();
  var totalDay = totalMs / (1000*60*60*24);
  var result = nowDay / totalDay * 100;

  res.render('result.ejs', {
    total : totalDay,
    now : nowDay,
    left : (totalDay-nowDay),
    per : result.toFixed(2)+'%'
  });

  console.log("총복무일수 : "+totalDay+"\n현재복무 일수 :"+nowDay+"\n남은 일수:"+(totalDay-nowDay));
  console.log(result.toFixed(2)+"%");

})


//  passport
passport.use(new LocalStrategy({
  usernameField: 'name',
  passwordField: 'passwd',
  session : true
}, (username, password, done) => {
  db.collection('users').findOne({ id: username }, (err, user) => {
    if (err) return done(err)
    if (!user) return done(null, false, { message: '존재하지않는 아이디 입니다.' });
    if (password == user.password) {
      return done(null, user)
    } else {
      return done(null, false, { message: '비밀번호를 확인해 주세요.' })
    }
  })
}));

//  passport - session 생성
passport.serializeUser(function (user, done) {
  done(null, user.id)
});

passport.deserializeUser(function (id, done) {
    db.collection('users').findById(id, (err, result) => {
            done(err, result);
    })
}); 
