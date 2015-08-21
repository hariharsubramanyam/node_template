// Main entrypoint for the application.

import 'source-map-support/register';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import routes from './routes/index';
import authRoute from './routes/auth';
import usersRoute from './routes/users';
import connectionsRoute from './routes/connections';
import connectToMongo from './config/mongodb';

connectToMongo();

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('stylus').middleware(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../public')));

// Set up routes.
app.use('/', routes);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', usersRoute);
app.use('/api/v1/', connectionsRoute);

// catch 404 and forward to error handler
app.use(function handle404(req, res, next) {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function handleDev500(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function handleProd500(err, req, res) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {},
  });
});

export default app;
