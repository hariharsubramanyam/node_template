'use strict';

var express = require('express');

// This causes a lint error because only constructors are allowed to have positive letters.
/*eslint-disable*/
var router = express.Router();
/*eslint-enable*/

/* GET home page. */
router.get('/', function serveRoot(req, res) {
  res.render('index', { title: 'Express' });
});

module.exports = router;