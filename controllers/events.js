const bodyParser = require('body-parser');
const User = require('../models/User');
const Event = require('../models/Event');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

module.exports = function(app) {

  /**** GET all events ****/
  app.get('/events', (req, res, next) => {
    Event.find(function(err, events) {
      if (err) {
        console.log(err)
        res.status(500).send({message: "Could not get all events"})
      }
      res.send(events);
    })
  });

  /**** GET Nearby Haps ****/
  app.post('/near_events', (req, res) => {
    const maxDistance = 0.3;
    Event.find({loc: {$near:req.body.userLoc, $maxDistance: maxDistance} }, function(err, haps){
      if(haps){
        res.send(haps);
      }
    });
  })

  /**** GET an event by ID ****/
  app.get('/events/:eventId', (req, res, next) => {
    Event.findById(req.params.eventId).exec(function(err, event) {
      if (err) {
        return res.status(500).send("Could not get this event");
      }
      // console.log(event);
      return res.status(200).send(event);
    })
  })

  /**** GET the list of events created by a given user ****/
  app.get('/users/:userId/events', (req, res) => {
    // Look up the user by id and populate the array of events they've created
    User.findById(req.params.userId).populate('events').exec(function(err, user) {
      if (err) {
        console.log("Error: " + err);
        return res.status(401).send({message: "Could not find user", err});
      }
      console.log("User events: ", user.events)
      return res.status(200).send({ events: user.events })
    })
  })

  /**** GET the list of events that the a given user is attending ****/
  app.get('/users/:userId/attending', (req, res) => {
    console.log("Getting all events this user is attending")
    // Loop up the user by id and populate the array of events they're attending
    User.findById(req.params.userId).populate('attending').exec(function(err, user) {
      if (err) {
        console.log("Error: " + err);
        return res.status(401).send({message: "Could not find user", err});
      }
      console.log("User events: ", user.attending)
      return res.status(200).send({ events: user.attending })
    })
  })

  /**** Set a given user's rsvp for an event to either true or false ****/
  /**** STILL IN PROGRESS ****/
  app.post('/events/:eventId/rsvp', (req, res) => {
    console.log('RSVPing to event');
    // First look up the user by the id passed in the body
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
        user.save(); // TODO next lines should be in a promise (?)
        user.markModified('attending');
        return res.status(200);
      })
    })
  })

  /**** CREATE a new event ****/
  app.post('/events/new', (req, res) => {
    // first look up the user with the id passed in the body
    User.findById(req.body.userId).exec(function(err, user) {
      if (err) {
        console.log("Error: " + err)
        return res.status(401).send({message: "Could not find user"});
      }
      if (!user) {
        return res.status(401).send({message: "Could not find user"});
      }

      // Create an Event object from the data in the request body
      const event = new Event({
        name: req.body.name,
        address: req.body.address,
        placeId: req.body.placeId,
        lat: req.body.lat,
        lng: req.body.lng,
        loc: [req.body.lng, req.body.lat],
        date: req.body.date,
        description: req.body.description,
        organizer: user.username,
        organizerId: req.body.userId,
        tags: req.body.tags
      })

      // Then save the event to the database
      event.save(function(err, createdEvent) {
        if (err) {
          console.log("Could not save event!")
          console.log(err)
          return res.status(500).send({message: "Could not save event", err})
        }
        console.log("Saved new event!")

        // Save the ID of the created event to the user who created it
        user.events.push(createdEvent._id);
        user.save(); // TODO next lines should be in a promise (?)
        user.markModified('events');
        return res.status(200).send(event);
      })
    })
  })

}
