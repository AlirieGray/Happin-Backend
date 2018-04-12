let User = require('../models/User');
let jwt = require('jsonwebtoken');

module.exports = function(app, passport) {

  // post login
  app.post('/login', function(req, res) {
    User.findOne({ username: req.body.username }, "+password", function (err, user) {
      if (!user) {
        //console.log('could not find user');
        res.send({ err: 'Wrong username'});
      }
      else if(!user.validPassword(req.body.password)){
        res.send({ err: 'Wrong password' });
      }  else {
        var token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: "60 days" });

        res.cookie('token', token);
        res.status(200).json(
          {
            message: 'Logged in',
            token: token,
            userId: user.id,
          }
        );
      };
    });
  });

  // sign-up
  app.post('/signup', function(req, res) {
    // create User and JWT

    //If User Exists Already
    User.findOne({username : req.body.username}, (err, user) => {
      if(user) {
        res.send({err : 'Username Taken'});
      } else {
        let newUser = new User({username : req.body.username});
        newUser.password = newUser.generateHash(req.body.password);
        newUser.save((err, newUser) => {
          if (err) {
            res.status(500).send({ err: err });
          }
          // generate a JWT for this user from the user's id and the secret key
          var token = jwt.sign({ id: newUser.id}, process.env.SECRET, { expiresIn: "60 days"});
          res.cookie('token', token);
          res.status(200).json({
            message: 'Signed up',
            token: token,
            userId: newUser.id
          });

        });
      }
    });
  });

  app.get('/logout', (req, res) => {
    res.clearCookie("token");
  })

};
