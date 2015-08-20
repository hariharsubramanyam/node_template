import 'source-map-support/register';
import mongoose from 'mongoose';
import {MONGO_URL} from './secrets';

export default function connect() {
  mongoose.connect(MONGO_URL);
  return mongoose.connection;
}
