const bodyParser = require('body-parser');
const User = require('../models/User');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');

module.exports = function(app) {

  // get all events
  app.get('/events', (req, res, next) => {
    Event.find(function(err, events) {
      if (err) {
        console.log(err)
        return res.status(500).send({message: "Could not get all events"})
      }
      return res.send(events);
    })
  })

  // get an event by ID
  app.get('/events/:id', (req, res, next) => {
    Event.findById(req.params.id).exec(function(err, event) {
      if (err) {
        return res.status(500).send("Could not get this event");
      }
      console.log(event);
      return res.status(200).send(event);
    })
  })

  // get the list of events created by a given user
  app.get('/users/:userId/events', (req, res) => {
    console.log("getting all events for this user")
    User.findById(req.params.userId).exec(function(err, user) {
      console.log(user);
      if (err) {
        console.log("Error: " + err);
        return res.status(401).send({message: "Could not find user", err});
      }
      return res.status(200).send({ events: user.events })
    })
  })

  // create a new event
  app.post('/events/new', (req, res) => {
    User.findById(req.body.userId).exec(function(err, user) {
      console.log(user)
      if (err) {
        console.log("Error: " + err)
        return res.status(401).send({message: "Could not find user", err});
      }

      const event = new Event({
        name: req.body.name,
        address: req.body.address,
        placeId: req.body.placeId,
        lat: req.body.lat,
        lng: req.body.lng,
        date: req.body.date,
        description: req.body.description,
        organizer: user.username
      })

      event.save(function(err) {
        if (err) {
          console.log("Could not save event!")
          console.log(err)
          return res.status(500).send({message: "Could not save event", err})
        }
        console.log("Saved new event!")

      }).then(() => {
        user.events.push(event);
        user.markModified('events');
        return res.status(200).send(event)
      })
    })
  })

}
