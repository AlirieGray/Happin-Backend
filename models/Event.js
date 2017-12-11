var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;
const User = require('./User');

var EventSchema = new Schema({
    createdAt       : { type: Date }
  , updatedAt       : { type: Date }
  , description     : { type: String }
  , date            : { type: String }
  , name            : { type: String }
  , address         : { type: String }
  , placeId         : { type: String }
  , lat             : { type: Number }
  , lng             : { type: Number }
  , organizers      : []
});

EventSchema.pre('save', function(next){
  // SET createdAt AND updatedAt
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});


module.exports = mongoose.model('Event', EventSchema);
