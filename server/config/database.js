// Connects to the production mongo database.

import 'source-map-support/register';
import mongoose from 'mongoose';
import {MONGO_URL, MONGO_TEST_URL} from './secrets';

export default function connect(isTest) {
  if (isTest) {
    mongoose.connect(MONGO_TEST_URL);
  } else {
    mongoose.connect(MONGO_URL);
  }
  return mongoose.connection;
}
