const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors')
const jwt = require('jsonwebtoken');
require('dotenv').config();


// App View Engine, Static Files, and BodyParser
app.set('view engine' , 'pug');
app.use('/public/css', express.static(__dirname + '/public/css'));
app.use('/public/scripts', express.static(__dirname + '/public/scripts'));
app.use('/public/assets', express.static(__dirname + '/public/assets'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

/***** set up mongoose *****/
mongoose.promise = global.promise;
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/happin-local');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));



// check that a user is logged in
let checkAuth = function (req, res, next) {
  // make sure the user has a JWT cookie
  if (typeof req.cookies.token === 'undefined' || req.cookies.token === null) {
    req.user = null;
    //console.log("no user");
  } else {
    // if the user has a JWT cookie, decode it and set the user
    var token = req.cookies.token;
    var decodedToken = jwt.decode(token, { complete: true }) || {};
    req.user = decodedToken.payload;
    //console.log("user set");
    //console.log(req.user);
  }
  // console.log(req.user);
  next();
}

app.use(checkAuth);

// root controller
require('./controllers/root.js')(app)
// authentication controller
require('./controllers/auth.js')(app);
// events controllers
require('./controllers/events.js')(app);

var PORT = process.env.PORT || 8000;

app.listen(PORT, function(req, res) {
  console.log("listening on port " + PORT);
});
