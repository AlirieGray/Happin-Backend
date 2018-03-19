var mongoose = require('mongoose'),
    bcrypt = require('bcrypt'),
    Schema = mongoose.Schema;
const Event = require('./Event');

var UserSchema = new Schema({
    createdAt       : { type: Date }
  , updatedAt       : { type: Date }
  , password        : { type: String, select: false }
  , username        : { type: String, required: true, unique: true }
  , events          : [ { type: Schema.Types.ObjectId, ref: 'Event'} ]
});

UserSchema.pre('save', function(next){
  // SET createdAt AND updatedAt
  var now = new Date();
  this.updatedAt = now;
  if ( !this.createdAt ) {
    this.createdAt = now;
  }

  // ENCRYPT PASSWORD
  var user = this;
  if (!user.isModified('password')) {
    return next();
  }
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(user.password, salt, function(err, hash) {
      user.password = hash;
      next();
    });
  });
});


UserSchema.methods.comparePassword = function(password, done) {
  bcrypt.compare(password, this.password, function(err, isMatch) {
    done(err, isMatch);
  });
};

module.exports = mongoose.model('User', UserSchema);
