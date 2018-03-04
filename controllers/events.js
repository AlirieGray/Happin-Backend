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
        return res.status(200).send(event)
      })
    })
  })

}
