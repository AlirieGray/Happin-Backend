const Event = require('../models/Event');
const User = require('../models/User');
module.exports = (io, socket) => {


//Date Formatting function
function dateFormattedToString(date, time) {
  let year = date.substr(6,4);
  let day = date.substr(3,2);
  let month = date.substr(0,2);
  let hours = time.substr(0,2);
  let minutes = time.substr(3,2);
  let ampm = time.substr(6,2);
  if(ampm == "PM"){
    hours = Number(hours) + 12;
  }
  let dateString = year + "-" + month + "-" + day + "T" + hours + ":" + minutes + ":00Z";
  let newDate = new Date(dateString);
  return newDate;
}


//Have Socket Join Hap Rooms
  socket.on('Connect To Haps', (d) => {
    d.hapIds.forEach((hapId) => {
      socket.join(hapId);
    })
  })

//Creating a New Hap
  socket.on('New Hap', (d) => {
    let newHap = new Event(d.hap);
    let newHapDate = dateFormattedToString(d.hap.date, d.hap.time);
    newHap.dateFormatted = (d.hap.date + " at " + d.hap.time);
    newHap.date = newHapDate;
    newHap.loc = [d.hap.lng, d.hap.lat];
    io.emit('New Hap', {hap : newHap});
    newHap.save((err, newHap) => {
      if (err) {
        console.log("New Hap Error: ", err)
        io.emit('Error', {err})
      }

      User.findById(newHap.organizerId, (err, user)=>{
        user.events.push(newHap._id);
        newHap.attendees.push(user._id);
        user.attending.push(newHap._id);
        socket.join(newHap._id, () => {
          user.save();
          newHap.save();
          console.log(user.username + " has created " + newHap.name);
        });
      })
    });
  });

  //New Hap pins
  socket.on('New Hap Pin', (d) => {
    let newHapPin = {
      pos : d.pos,
      img : d.img,
      id : d.id
    }
    io.to(d.hapId).emit('New Hap Pin', newHapPin);
    Event.findById(d.hapId, (err, hap) => {
      hap.pins.push(newHapPin);
      hap.save((err, hap) => {
        console.log(hap);
      })
    })
  });

  socket.on('Hap Pin Drag', (d) => {
    io.to(d.hapId).emit('Hap Pin Drag', d);
    Event.findById(d.hapId, (err, hap) => {
      let movedPin = hap.pins.find((pin => pin.id == d.id));
      movedPin.pos = d.pos;
      hap.save();
    })
  })


//Joining a Hap to Attend
  socket.on('Join Hap', (d) => {
    Event.findById(d.hapId, (err, hap) => {
      User.findById(d.userId, (err, user) => {
        //Cant join a hap you're already attending
        if(!hap.attendees.includes(d.userId)){
          hap.attendeeCount++;
          hap.attendees.push(d.userId);
          user.attending.push(d.hapId);
          hap.save();
          user.save();
          socket.join(d.hapId, () => {
            io.to(d.hapId).emit('Join Hap', {
              hapId : d.hapId,
              newPerson : user,
              attendeeCount : hap.attendeeCount});
            console.log(user.username + " has joined " + hap.name);
          });
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
          io.to(d.hapId).emit('Leave Hap', {
            hapId : d.hapId,
            attendeeCount : hap.attendeeCount,
            personId : user._id
          });
          socket.leave(d.hapId);
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
