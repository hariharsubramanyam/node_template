// Main entrypoint for the application.
//
// You can call it with:
//
// --mongoUrl <url>
// The url pointing to the database.

import 'source-map-support/register';
import minimist from 'minimist';
import setupErrors from './config/errors';
import setupMiddleware from './config/middleware';
import express from 'express';
import setupDatabase from './config/database';
import setupRoutes from './config/routes';

const argv = minimist(process.argv.slice(2));

setupDatabase(argv.mongoUrl);

const app = express();
setupMiddleware(app);
setupRoutes(app);
setupErrors(app);

export default app;
