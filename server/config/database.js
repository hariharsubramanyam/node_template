// Connects to the production mongo database.

import 'source-map-support/register';
import mongoose from 'mongoose';
import {MONGO_URL} from './secrets';

export default function connect(mongoUrl) {
  let actualUrl = mongoUrl;
  if (mongoUrl === undefined) {
    actualUrl = MONGO_URL;
  }
  mongoose.connect(actualUrl);
  return mongoose.connection;
}
