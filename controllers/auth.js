var bodyParser = require('body-parser');
var User = require('../models/User');
var jwt = require('jsonwebtoken');

module.exports = function(app) {

  // post login
  app.post('/login', function(req, res, next) {
    console.log('got post request');
    User.findOne({ username: req.body.username }, "+password", function (err, user) {
      if (!user) { return res.status(401).send({ message: 'Wrong username' }) };
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (!isMatch) {
          return res.status(401).send({ message: 'Wrong password' });
        }
        console.log('logged in, sending token');
        var token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: "60 days" });
        res.cookie('nToken', token, { maxAge: 900000, httpOnly: true });
        return res.status(200).send({ message: 'Logged in', id_token: user.id, access_token: token });
      });
    });
  });

  // logout
  app.get('/logout', function(req, res) {
    res.clearCookie('nToken');
  });

  // sign-up
  app.post('/sign-up', function(req, res, next) {
    // create User and JWT
    console.log('signing up backend')
    console.log(req.body);
    var user = new User(req.body);

    user.save(function (err) {
      if (err) {
        return res.status(500).send({ err: err });
      }
      // generate a JWT for this user from the user's id and the secret key
      var token = jwt.sign({ id: user.id}, process.env.SECRET, { expiresIn: "60 days"});
      // set the jwt as a cookie so that it will be included in
      // future request from this user's client
      res.cookie('nToken', token, { maxAge: 900000, httpOnly: false});
      return res.status(200).send({ message: 'Signed up', token: token });
    })
  });
}
