const Event = require('../models/Event');
const User = require('../models/User');
module.exports = (io, socket) => {


//Creating a New Hap
  socket.on('New Hap', (d) => {
    let newHap = new Event(d.hap);
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
        if(!hap.attendees.includes(user._id)){
          hap.attendees.push(user._id);
          hap.attendeeCount++;
          user.attending.push(hap._id);
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
        //Cant leave an Event you're not attending
        if(hap.attendees.includes(user._id)){
          hap.attendees.splice(hap.attendees.indexOf(user._id), 1);
          hap.attendeeCount--;
          user.attending.splice(user.attending.indexOf(hap._id), 1);
          hap.save();
          user.save();
          console.log(user.username + " has left " + hap.name);
        }else{
          console.log(hap.attendees);
          console.log(user._id);
          console.log(hap.attendees.includes(user._id));
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
          if(!invitee.attending.includes(hap._id)){
            let newInvite = {
              inviterName : inviter.username,
              hapName : hap.name
            };
            invitee.invites.append(newInvite);
            invitee.save();
            console.log(inviter.username + " has invited " + invitee.username + " to join " + hap.name);
          }
        })
      })
    })
  })

}
