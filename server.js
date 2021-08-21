const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const flash = require('connect-flash');
const MongoStore = require('connect-mongo');
const socket = require('socket.io');
const app = express();
const http = require('http').createServer(app);
const { Server } = require("socket.io");
const io = new Server(http);

const dburl = "mongodb+srv://h0ch1:a02070203@nodetest.kijps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

app.use(express.urlencoded({extended: true}));
app.set('view engine' , 'ejs');
app.use('/public', express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// db연결 & 서버 실행
var db
MongoClient.connect(dburl, (err, client) => {
    if(err) return console.log(err);

    db = client.db('armydate');

    http.listen(8080, () => {
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
})

// 게시판
app.get('/board', (req, res) => {
  db.collection('board').findOne()
  res.render('board.ejs', {});
})

app.get('/insert', (req, res) => {
  res.render('insert.ejs', {});
})


// socket.io
io.on('connection', (socket) => {
  
  socket.on('newUser', (name)=> {
    socket.name = name;
    io.sockets.emit('update',{
      type: 'connect',
      name: 'SERVER',
      message: name+'님이 접속하였습니다'
    });
  });

  socket.on('message', (data) => {
    data.name = socket.name;
    socket.broadcast.emit('update', data);
  })

  socket.on('disconnect', () => {
    socket.broadcast.emit('update', {
      type: 'disconnect',
      name: 'SERVER',
      message: socket.name+'님이 나가셨습니다'
    });
  })

  socket.on('msg', (msg) => {
    io.emit('update', {
      type: 'msg',
      name: socket.name,
      message: msg
    });
  });
})
