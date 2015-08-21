import 'source-map-support/register';
import express from 'express';
import path from 'path';
import logger from 'morgan';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';

export default function setupMiddleware(app, relativePublicDir = '../public') {
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'hbs');

  app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(cookieParser());
  app.use(require('stylus').middleware(path.join(__dirname, relativePublicDir)));
  app.use(express.static(path.join(__dirname, relativePublicDir)));
}
