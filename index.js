const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const cors = require('cors')
require('dotenv').config();


// App View Engine, Static Files, and BodyParser
app.set('view engine' , 'pug');
app.use('/public/css', express.static(__dirname + '/public/css'));
app.use('/public/scripts', express.static(__dirname + '/public/scripts'));
app.use('/public/assets', express.static(__dirname + '/public/assets'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

/***** set up mongoose *****/
mongoose.promise = global.promise;
mongoose.connect(`mongodb://${process.env.dbUsername}:${process.env.dbPassword}@ds129066.mlab.com:29066/activize`);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

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
