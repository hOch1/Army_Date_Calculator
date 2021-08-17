app.use(session({
    secret:"#JDKLF439jsdlfsjl",
    resave:false,
    saveUninitialized:true,
    store: sessionStore
  }))
  
  //미들웨어 장착
  var passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy;
  app.use(passport.initialize());                 
  app.use(passport.session());                    
  
  //Session 관리
  passport.serializeUser(function(user, done) {             
    done(null, user.id);
  });
  passport.deserializeUser(function(id, done) {             
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
  
  //LocalStrategy
  passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'passwd'
    },
    function(username, password, done) {
      User.findOne({ username: username }, function(err, user) {                   
        if (err) { return done(err); }                                             
        if (!user) {                                                               
          return done(null, false, { message: 'Incorrect username.' });
        }
        if (!user.validPassword(password)) {
          return done(null, false, { message: 'Incorrect password.' });            
        }
        return done(null, user);                                                   
      });
    }
  ));
  
  //로그인 성공과 실패 시 Routing
  app.post('/login', passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/login'
      //failureFlash: true
      })
  );