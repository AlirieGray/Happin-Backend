var bodyParser = require('body-parser');
var User = require('../models/User');
var Event = require('../models/Event');
var jwt = require('jsonwebtoken');

module.exports = function(app) {

  app.get('/new-event', (req, res) => {
    return res.status(200);
  })
}
