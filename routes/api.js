var express = require("express");
var route_utils = require("./route_utils.js");
var router = express.Router();

router.post("/heartbeats/", function(req, res) {

  // Extract the desired parameters.
  var LATITUDE = "latitude";
  var LONGITUDE = "longitude";
  var params = route_utils.check_params([LATITUDE, LONGITUDE], req, res);
  if (params === null) {
    return;
  }

  res.send("Your latitude is " + params[LATITUDE] + " and your longitude is " + params[LONGITUDE]);
});

module.exports = router;
