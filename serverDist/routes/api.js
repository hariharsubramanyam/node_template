'use strict';

var express = require('express');
var routeUtils = require('./route_utils.js');

// This causes a lint error because only constructors are allowed to have positive letters.
/*eslint-disable*/
var router = express.Router();
/*eslint-enable*/

router.post('/heartbeats/', function handleHeartbeat(req, res) {
  // Extract the desired parameters.
  var LATITUDE = 'latitude';
  var LONGITUDE = 'longitude';
  var params = routeUtils.check_params([LATITUDE, LONGITUDE], req, res);
  if (params === null) {
    return;
  }

  res.send('Your latitude is ' + params[LATITUDE] + ' and your longitude is ' + params[LONGITUDE]);
});

module.exports = router;