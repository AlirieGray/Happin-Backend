var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;
const User = require('./User');

var EventSchema = new Schema({
    createdAt       : { type: Date }
  , updatedAt       : { type: Date }
  , date            : { type: String }
  , name            : { type: String }
  , loc             : { type: String } // temp
  , lat             : { type: String }
  , lng             : { type: String }
  , organizers      : []
});

EventSchema.pre('save', function(next){
  // SET createdAt AND updatedAt
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
});


module.exports = mongoose.model('Event', EventSchema);
