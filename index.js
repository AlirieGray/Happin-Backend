const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config();

// user database model
var User = require('./models/User.js');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// allow CORS (for development)
// app.use(function(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
//     next();
// });

// check that a user is logged in
var checkAuth = function (req, res, next) {
  console.log("Body: ",req.body);
  console.log("Checking authentication");
  // make sure the user has a JWT cookie
  if (req.cookies === undefined || req.cookies.nToken === null) {
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
mongoose.connect(`mongodb://${process.env.dbUsername}:${process.env.dbPassword}@ds129066.mlab.com:29066/activize`);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));


// authentication controller
require('./controllers/auth.js')(app);
// events controllers
require('./controllers/events.js')(app);

var PORT = process.env.PORT || 8000;

app.listen(PORT, function(req, res) {
  console.log("listening on port " + PORT);
});
