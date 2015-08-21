import 'source-map-support/register';
import setupErrors from './config/errors';
import setupMiddleware from './config/middleware';
import express from 'express';
import setupDatabase from './config/database';
import setupRoutes from './config/routes';

export default function createApp(isTestServer) {
  setupDatabase(isTestServer);

  const app = express();
  setupMiddleware(app);
  setupRoutes(app);
  setupErrors(app);
  return app;
}
