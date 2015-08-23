// Helper functions for interacting with the requests and responses.

import 'source-map-support/register';
import HttpStatus from 'http-status-codes';

function checkHelper(key, names, req, res, callback) {
  const params = new Map();
  let missingArg = null;
  for (const name of names) {
    if (req[key][name] === undefined) {
      missingArg = name;
      break;
    } else {
      params.set(name, req[key][name]);
    }
  }
  if (missingArg !== null) {
    const err = new Error('You are missing the ' + missingArg + ' param');
    err.statusCode = HttpStatus.BAD_REQUEST;
    callback(err);
  } else {
    callback(null, params);
  }
}

// Check that the values in 'names' (an array of strings) appear in the request body. If they all
// appear, extract them and return them in a map with key=param name and value=param value.
export function checkBody(names, req, res, callback) {
  checkHelper('body', names, req, res, callback);
}

// Check that the values in 'names' (an array of strings) appear in the request URL. If they all
// appear, extract them and return them in a map with key=param name and value=param value.
export function checkParams(names, req, res, callback) {
  checkHelper('params', names, req, res, callback);
}

// Send a JSON response indicating a successful operation.
export function sendSuccessResponse(res, message, content) {
  res.status(HttpStatus.OK).json({
    'message': message.toString(),
    'content': content,
  });
}

// Send a JSON response indicating a failed operation.
export function sendFailureResponse(res, code, message) {
  res.status(code).json({
    'message': message.toString(),
  });
}
