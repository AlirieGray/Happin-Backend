var bodyParser = require('body-parser');
var User = require('../models/User');
var jwt = require('jsonwebtoken');

module.exports = function(app) {

  // post login
  app.post('/login', function(req, res) {
    User.findOne({ username: req.body.username }, "+password", function (err, user) {
      if (!user) {
        console.log('could not find user');
        return res.status(401).send({ message: 'Wrong username'
      })};
      user.comparePassword(req.body.password, function (err, isMatch) {
        if (!isMatch) {
          console.log('Wrong password')
          return res.status(401).send({ message: 'Wrong password' });
        }
        console.log('logged in, sending token');
        var token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: "60 days" });

        return res.status(200).json(
          {
            message: 'Logged in',
            token: token,
            userId: user.id
          }
        );
      });
    });
  });

  // sign-up
  app.post('/signup', function(req, res) {
    // create User and JWT
    console.log(req.body);
    var user = new User(req.body);

    user.save(function (err) {
      if (err) {
        return res.status(500).send({ err: err });
      }
      // generate a JWT for this user from the user's id and the secret key
      var token = jwt.sign({ id: user.id}, process.env.SECRET, { expiresIn: "60 days"});

      return res.status(200).json(
        {
          message: 'Signed up',
          token: token,
          userId: user.id
        }
      );
    })
  });
}
