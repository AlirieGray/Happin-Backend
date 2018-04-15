var mongoose = require('mongoose'),
    bcrypt = require('bcrypt-nodejs'),
    Schema = mongoose.Schema;
const Event = require('./Event');

var UserSchema = new Schema({
    createdAt       : { type: Date }
  , updatedAt       : { type: Date }
  , password        : { type: String, select: false }
  , username        : { type: String, required: true, unique: true }
  , events          : [{type: Schema.Types.ObjectId, ref: 'Event'}]
  , attending       : [{type: Schema.Types.ObjectId, ref: 'Event'}]
  , invites         : []
  , picture         : { type: String, default : 'http://www.freelogovectors.net/wp-content/uploads/2015/06/turtle-icon.png'}
});

UserSchema.pre('save', function(next){
  // SET createdAt AND updatedAt
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }
  next();
});

// generating a hash
UserSchema.methods.generateHash = function(password) {
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);
};

// checking if password is valid
UserSchema.methods.validPassword = function(password) {
    return bcrypt.compareSync(password, this.password);
};

module.exports = mongoose.model('User', UserSchema);
