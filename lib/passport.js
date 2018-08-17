var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var db = require('./mongoose');

passport.use(new LocalStrategy({
  usernameField: 'id',
  passwordField: 'passwd',
  session: true
},
  function(id, passwd, done) {
    var User = db.getConnection('INFO').model('user', db.Schema.user);

    User.findOne({id: id}, function(err, user) {
      if (err) return done(err);
      else if (!user || !isvalidPassword(passwd, user.passwd)) return done(null, false, { message: 'Invalid ID or PASSWORD' });
      return done(null, user);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  done(null, id);
});

passport.checkAuthenticate = function(req, res, next) {
    if (req.isAuthenticated()) next();
    else res.redirect('/login');
};

function isvalidPassword(input, find) {
  if(input !== find) return false;
  return true;
}

module.exports = passport;
