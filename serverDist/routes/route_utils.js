'use strict';

var HttpStatus = require('http-status-codes');

function checkParams(names, req, res) {
  var params = {};
  var failed = false;
  for (var i = 0; i < names.length; i++) {
    if (req.body[names[i]] === undefined) {
      failed = true;
      res.status(HttpStatus.BAD_REQUEST).json({
        'success': 'false',
        'error': 'You need to provide the ' + names[i] + ' parameter.'
      });
    } else {
      params[names[i]] = req.body[names[i]];
    }
  }
  if (failed) {
    return null;
  }
  return params;
}

module.exports = {
  'checkParams': checkParams
};