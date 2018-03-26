const Event = require('../models/Event');
module.exports = (io, socket) => {

  socket.on('New Hap', (d) => {
    let newHap = new Event(d.hap);
    console.log(newHap);
    io.emit('New Hap', {hap : newHap});
  })

}
