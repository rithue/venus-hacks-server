var express = require("express");
var router = express.Router();
let worker = require("../routes/worker");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/carbonContent", function (req, res) {
  worker.getCarbonContent(
    req.query.startZipCode,
    req.query.endZipCode,
    req.query.fuelType,
    function (response) {
      res.send(response);
    }
  );
});

module.exports = router;