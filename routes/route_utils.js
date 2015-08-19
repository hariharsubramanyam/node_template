var HttpStatus = require("http-status-codes");

var check_params = function(names, req, res) {
  var value_for_param = {};
  var failed = false;
  for (var i = 0; i < names.length; i++) {
    if (req.body[names[i]] === undefined) {
      failed = true;
      res.status(HttpStatus.BAD_REQUEST)
        .json({
          "success": "false",
          "error": "You need to provide the " + names[i] + " parameter."
        });
    } else {
      value_for_param[names[i]] = req.body[names[i]];
    }
  }
  if (failed) {
    return null;
  }
  return value_for_param;
}

module.exports = {
  "check_params": check_params
};
