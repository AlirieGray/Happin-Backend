const Event = require('../models/Event');
const User = require('../models/User');
module.exports = (io, socket) => {


//Date Formatting function
function getFormattedDate(date) {
  var year = date.getFullYear();
  var month = (1 + date.getMonth()).toString();
  month = month.length > 1 ? month : '0' + month;
  var day = date.getDate().toString();
  day = day.length > 1 ? day : '0' + day;
  let hour = date.getHours();
  let ampm;
  if(hour == 0){
    hour = "12";
    ampm = "am";
  }else if(hour == 12){
    hour = hour.toString();
    ampm = "pm";
  }else if(hour > 12){
    hour = (hour - 12).toString();
    ampm = "pm";
  }else{
    hour = hour.toString();
    ampm = "am"
  }
  let minute = date.getMinutes().toString();
  minute = minute.length > 1 ? minute : '0' + minute;
  return month + '/' + day + '/' + year + " at " + hour + ":" + minute + ampm;
}


//Have Socket Join Hap Rooms
  socket.on('Connect To Haps', (d) => {
    d.hapIds.forEach((hapId) => {
      socket.join(hapId);
    })
  })

//Creating a New Hap
  socket.on('New Hap', (d) => {
    console.log("d: ", d);
    console.log("d.hap: ", d.hap);
    let newHap = new Event(d.hap);
    console.log('new hap: ', newHap)
    let newHapDate = new Date(d.hap.date);
    newHap.dateFormatted = getFormattedDate(newHapDate);
    newHap.date = (d.hap.date + " at " + d.hap.time);
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
              username : user.username,
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
            attendeeCount : hap.attendeeCount
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
