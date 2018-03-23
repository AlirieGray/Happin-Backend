module.exports = (app) => {

  app.get('/', (req, res) => {
    const mapApiKey = 'AIzaSyCucitjj7AcVk8Hv35Pd6JVPQiNhzB8LwI';
    res.render('index', {mapApiKey : mapApiKey});
  })

}
