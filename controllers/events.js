const bodyParser = require('body-parser');
const User = require('../models/User');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

module.exports = function(app) {

  app.get('/events', (req, res) => {
    Event.find(function(err, events) {
      return res.send(events);
    })
  })

  app.post('/events/new', (req, res) => {

    // TODO: deal with organizer of event
    //const organizer = User.findById...
    console.log(req.body);

    const event = new Event({
      name: req.body.name,
      address: req.body.address,
      placeId: req.body.placeId,
      date: req.body.date
    });

    console.log(event);

    event.save(function(err) {
      if (err) {
        console.log("backend error!")
        return res.status(500).send({err: err});
      }
      console.log('save new event!')
      return res.status(200).send(event);
    })
  })
}
