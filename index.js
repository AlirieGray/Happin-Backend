const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
require('dotenv').config();

// user database model
var User = require('./user-model');

// check that a user is logged in
var checkAuth = function (req, res, next) {
  //console.log("Checking authentication");
  // make sure the user has a JWT cookie
  if (typeof req.cookies.nToken === 'undefined' || req.cookies.nToken === null) {
    req.user = null;
    //console.log("no user");
  } else {
    // if the user has a JWT cookie, decode it and set the user
    var token = req.cookies.nToken;
    var decodedToken = jwt.decode(token, { complete: true }) || {};
    req.user = decodedToken.payload;
    //console.log(req.user);
  }
  // console.log(req.user);
  next();
}
app.use(checkAuth);

/***** set up mongoose *****/
mongoose.promise = global.promise;
mongoose.connect('mongodb://heroku_7b5528r5:5i5sjiqq5d2auug32ingk3jeac@ds143245.mlab.com:43245/heroku_7b5528r5');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


// authentication controller
require('../controllers/auth.js')(app);
// events controllers
require('../controllers/events.js')(app);

var PORT = process.env.PORT || 8000;

app.listen(PORT, function(req, res) {
  console.log("listening!");
});
