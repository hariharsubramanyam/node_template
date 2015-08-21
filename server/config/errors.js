import 'source-map-support/register';
import HttpStatus from 'http-status-codes';

function handle404(req, res, next) {
  const err = new Error('Not Found');
  err.status = HttpStatus.NOT_FOUND;
  next(err);
}

function make500Handler(isDev) {
  function handle500(err, req, res) {
    let errorDetails = {};
    if (isDev) {
      errorDetails = err;
    }
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: errorDetails,
    });
  }
  return handle500;
}

export default function setupErrors(app) {
  app.use(handle404);
  app.use(make500Handler(app.get('env') === 'development'));
}
