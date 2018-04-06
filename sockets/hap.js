const Event = require('../models/Event');
const User = require('../models/User');
module.exports = (io, socket) => {


//Creating a New Hap
  socket.on('New Hap', (d) => {
    let newHap = new Event(d.hap);
    newHap.loc = [d.hap.lng, d.hap.lat];
    io.emit('New Hap', {hap : newHap});
    newHap.save((err, newHap) => {
      User.findById(newHap.organizerId, (err, user)=>{
        user.events.push(newHap._id);
        user.attending.push(newHap._id);
        newHap.attendees.push(user._id);
        user.save();
        newHap.save();
        console.log(user.username + " has created " + newHap.name);
      })
    });
  });


//Joining a Hap to Attend
  socket.on('Join Hap', (d) => {
    Event.findById(d.hapId, (err, hap) => {
      User.findById(d.userId, (err, user) => {
        //Cant join a hap you're already attending
        if(!hap.attendees.includes(d.userId)){
          hap.attendees.push(d.userId);
          hap.attendeeCount++;
          user.attending.push(d.hapId);
          hap.save();
          user.save();
          console.log(user.username + " has joined " + hap.name);
        }
      })
    })
  });

//Leaving a Hap you are Attending
  socket.on('Leave Hap', (d) => {
    Event.findById(d.hapId, (err, hap) => {
      User.findById(d.userId, (err, user) => {
        //Cant leave an Event you're not attending, Owner can't leave their hap
        if(hap.attendees.includes(d.userId) && hap.organizerId != d.userId){
          hap.attendees.splice(hap.attendees.indexOf(d.userId), 1);
          hap.attendeeCount--;
          user.attending.splice(user.attending.indexOf(d.hapId), 1);
          hap.save();
          user.save();
          console.log(user.username + " has left " + hap.name);
        }
      })
    })
  });

  //Inviting a User to a hap
  socket.on('Hap Invite', (d) => {
    Event.findById(d.hapId, (err, hap) => {
      User.findById(d.inviterId, (err, inviter) => {
        User.findOne({username : d.inviteeName}, (err, invitee) => {
          // Cant invite user to a hap theyre already attending
          if(!invitee.attending.includes(d.hapId)){
            let newInvite = {
              inviterName : inviter.username,
              hapName : hap.name
            };
            invitee.invites.push(newInvite);
            invitee.save();
            console.log(inviter.username + " has invited " + invitee.username + " to join " + hap.name);
          }
        })
      })
    })
  })

}
