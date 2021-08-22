const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const socket = require('socket.io');
const app = express();
const http = require('http').createServer(app);
const { Server } = require("socket.io");
const moment = require('moment');
const methodOverride = require('method-override');
const io = new Server(http);

const dburl = "mongodb+srv://h0ch1:a02070203@nodetest.kijps.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"

app.use(express.urlencoded({extended: true}));
app.set('view engine' , 'ejs');
app.use('/public', express.static('public'));
app.use(methodOverride('_method'));

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
  db.collection('board').find().toArray((err, result) => {
    res.render('board.ejs', {posts : result, moment});
  })
})

// 게시판 - 글 작성
app.get('/write', (req, res) => {

  res.render('write.ejs', {});
})

app.post('/add', (req, res) => {
  var now = new Date();
  var ny = now.getFullYear();
  var nm = now.getMonth();
  var nd = now.getDate();
  var nowdate = new Date(ny,nm,nd);

  db.collection('counter').findOne({ name : 'num' }, (err, result) => {
    var total_post = result.totalPost;

    db.collection('board').insertOne({ _id : total_post+1, title : req.body.title, date : nowdate, writer : req.body.writer, contents : req.body.content}, (err, result) => {
      db.collection('counter').updateOne({ name : 'num'}, { $inc : {totalPost:1}}, (err, resuilt) => {
        res.redirect('/board');
      })
    })
  })
})

// 게시판 - 상세페이지
app.get('/detail/:id', (req, res) => {
  db.collection('board').find().toArray((err, result) => {
    console.log(result);
    res.render('detail.ejs', {posts : result, id : req.params.id});
  })
})

// 게시판 - 수정
app.get('/edit/:id', (req, res) => {
  db.collection('board').findOne({_id : parseInt(req.params.id)}, (err, result) => {
    res.render('edit.ejs', {posts : result});
  })
})

app.put('/edit', (req, res) => {
  db.collection('board').updateOne({ _id : parseInt(req.body.id) },
  { $set : { title : req.body.title, writer : req.body.writer, contents : req.body.content}}, (err, result) => {
    console.log(req.body.id);
    res.redirect('/board');
  })
})

// 게시판 - 삭제
app.delete('/delete', (req, res) => {
  req.body._id = parseInt(req.body._id);
  db.collection('board').deleteOne(req.body, (err, result) => {
    console.log(req.body);
    console.log('삭제완료');
    res.redirect('/board');
  })
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
