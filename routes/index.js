var express = require('express');
var router = express.Router();
let worker = require('../routes/worker');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/carbonContent', function(req,res) {
  // worker.getCarbonContent(req.query.startZipCode,req.query.endZipCode,function(err,response){
  //   res.send({"distance":"40.56", "carbonEmission":"1000"});
  // });
  res.send({"distance":"40.56", "carbonEmission":"1000"});
});

module.exports = router;
