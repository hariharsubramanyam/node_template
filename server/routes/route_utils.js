import 'source-map-support/register';
import HttpStatus from 'http-status-codes';

export function checkParams(names, req, res, callback) {
  const params = {};
  let missingArg = null;
  for (const name of names) {
    if (req.body[name] === undefined) {
      missingArg = name;
      break;
    } else {
      params[name] = req.body[name];
    }
  }
  if (missingArg !== null) {
    callback('You are missing the ' + missingArg + ' param');
  } else {
    callback(null, params);
  }
}

export function sendSuccessResponse(res, message, content) {
  res.status(HttpStatus.OK).json({
    'success': true,
    'message': message.toString(),
    'content': content,
  });
}

export function sendFailureResponse(res, code, message) {
  res.status(code).json({
    'success': false,
    'message': message.toString(),
  });
}
