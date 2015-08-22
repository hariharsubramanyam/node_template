// Connections requests are sent from one user to another. When they are accepted, they are called
// connections.

import 'source-map-support/register';
import mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;

const ConnectionSchema = new mongoose.Schema({
  // ID of the user who sent the request to connect.
  'sender': {
    'type': ObjectId,
    'required': 'The connection must have a sender.',
  },
  // ID of the user who received the request to connect.
  'recipient': {
    'type': ObjectId,
    'required': 'The connection must have a recipient.',
  },
  // Whether the connection request has been accepted.
  'accepted': {
    'type': Boolean,
    'default': false,
  },
});

ConnectionSchema.index({'sender': 1, 'recipient': 1}, {'unique': true});

const Connection = mongoose.model('Connection', ConnectionSchema);
export default Connection;
