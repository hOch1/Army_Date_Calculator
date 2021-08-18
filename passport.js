//  passport
passport.use(new LocalStrategy({
  usernameField: 'name',
  passwordField: 'passwd',
}, function (username, password, done) {
  db.collection('users').findOne({ username: username }, function (err, result) {
    if (err) return done(err)
    if (!result) return done(null, false, { message: '존재하지않는 아이디 입니다.' })
    if (!result.validPassword(password)) {
      return done(null, result)
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


// 로그인 페이지 - 로그인 실패시
app.get('/fail', (req, res) => {
  res.render('fail.ejs');
})

var now = new Date();
var ny = now.getFullYear();
var nm = now.getMonth()+1;
var nd = now.getDate();
var nowdate = new Date(ny,nm,nd);