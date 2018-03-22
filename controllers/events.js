const bodyParser = require('body-parser');
const User = require('../models/User');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

module.exports = function(app) {

  // get all events
  app.get('/events', (req, res, next) => {
    Event.find(function(err, events) {
      if (err) {
        console.log(err)
        return res.status(500).send({message: "Could not get all events"})
      }
      return res.send({events});
    })
  })

  // get an event by ID
  app.get('/events/:eventId', (req, res, next) => {
    Event.findById(req.params.eventId).exec(function(err, event) {
      if (err) {
        return res.status(500).send("Could not get this event");
      }
      console.log(event);
      return res.status(200).send(event);
    })
  })

  // get the list of events created by a given user
  app.get('/users/:userId/events', (req, res) => {
    console.log("getting all events this user has created")
    User.findById(req.params.userId).populate('events').exec(function(err, user) {
      if (err) {
        console.log("Error: " + err);
        return res.status(401).send({message: "Could not find user", err});
      }
      console.log("User events: ", user.events)
      return res.status(200).send({ events: user.events })
    })
  })

  // get the list of events that the user is attending
  app.get('/users/:userId/attending', (req, res) => {
    console.log("getting all events this user is attending")
    User.findById(req.params.userId).populate('attending').exec(function(err, user) {
      if (err) {
        console.log("Error: " + err);
        return res.status(401).send({message: "Could not find user", err});
      }
      console.log("User events: ", user.attending)
      return res.status(200).send({ events: user.attending })
    })
  })

  app.post('/events/:eventId/rsvp', (req, res) => {
    console.log('RSVPing to event');

    User.findById(req.body.userId).exec(function(err, user) {
      if (err) {
        console.log("Error: " + err);
        return res.status(401).send({message: "Could not find user"});
      }
      if (!user) {
        return res.status(401).send({message: "Could not find user"});
      }

      // make sure that the event exists before saving it to the user model
      Event.findById(req.params.eventId).exec(function(err, event) {
        if (err) {
          console.log("Error: " + err)
          return res.status(500).send({message: "Could not find event"});
        }
        if (!event) {
          return res.status(401).send({message: "Could not find event"});
        }

        // if the user is RSVPing yes, add the id to user.attending
        if (req.body.rsvp) {
          user.attending.push(event._id);
          return res.status(200);
        }
        // if the user is RSVPing no, remove the id from user.attending
        user.attending = user.attending.filter((eventId) => {
          return eventId !== req.params.eventId
        })
        user.save(); // TODO next lines should be in a promise
        user.markModified('attending');
        return res.status(200);
      })
    })
  })

  // create a new event
  app.post('/events/new', (req, res) => {
    User.findById(req.body.userId).exec(function(err, user) {
      if (err) {
        console.log("Error: " + err)
        return res.status(401).send({message: "Could not find user"});
      }
      if (!user) {
        return res.status(401).send({message: "Could not find user"});
      }

      const event = new Event({
        name: req.body.name,
        address: req.body.address,
        placeId: req.body.placeId,
        lat: req.body.lat,
        lng: req.body.lng,
        date: req.body.date,
        description: req.body.description,
        organizer: user.username,
        organizerId: req.body.userId,
        tags: req.body.tags
      })

      event.save(function(err, createdEvent) {
        if (err) {
          console.log("Could not save event!")
          console.log(err)
          return res.status(500).send({message: "Could not save event", err})
        }
        console.log("Saved new event!")
        console.log(createdEvent._id);
        user.events.push(createdEvent._id);
        user.save(); // TODO next lines should be in a promise
        user.markModified('events');
        console.log('Modified user: ', user)
        return res.status(200).send(event);
      })
    })
  })

}
