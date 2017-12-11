const bodyParser = require('body-parser');
const User = require('../models/User');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

module.exports = function(app) {

  app.get('/events', (req, res, next) => {
    Event.find(function(err, events) {
      return res.send(events);
    })
  })

  app.get('/events/:id', (req, res, next) => {
    Event.findById(req.params.id).exec(function(err, event) {
      if (err) {
        return res.status(500).send("Could not fetch event");
      }
      console.log(event);
      return res.status(200).send(event);
    })
  })

  app.post('/events/new', (req, res, next) => {

    // TODO: deal with organizer of event
    //const organizer = User.findById...
    console.log(req.body.name);
    console.log(req.body.placeId);

    const event = new Event({
      name: req.body.name,
      address: req.body.address,
      placeId: req.body.placeId,
      date: req.body.date,
      description: req.body.description
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
