import HttpStatus from 'http-status-codes';

function checkParams(names, req, res) {
  const params = {};
  let failed = false;
  for (const name of names) {
    if (req.body[name] === undefined) {
      failed = true;
      res.status(HttpStatus.BAD_REQUEST)
        .json({
          'success': 'false',
          'error': 'You need to provide the ' + name + ' parameter.',
        });
    } else {
      params[name] = req.body[name];
    }
  }
  if (failed) {
    return null;
  }
  return params;
}

export default {
  'checkParams': checkParams,
};
