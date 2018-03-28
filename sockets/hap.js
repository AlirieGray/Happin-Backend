const Event = require('../models/Event');
module.exports = (io, socket) => {

  socket.on('New Hap', (d) => {
    let newHap = new Event(d.hap);
    io.emit('New Hap', {hap : newHap});
    newHap.save();
  })

}
