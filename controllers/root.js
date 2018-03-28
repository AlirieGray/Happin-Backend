let User = require('../models/User');
module.exports = (app) => {

  app.get('/', (req, res) => {
    const mapApiKey = 'AIzaSyCucitjj7AcVk8Hv35Pd6JVPQiNhzB8LwI';
    if(req.user){
      User.findById(req.user.id, (err, user) => {
        res.render('index', {mapApiKey : mapApiKey, user : user});
      })
    }else{
      res.render('index', {mapApiKey : mapApiKey});
    }
  })

}
