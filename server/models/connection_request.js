// Connection requests are sent from one user to another to create
// a connection.

import 'source-map-support/register';
import mongoose from 'mongoose';

const ObjectId = mongoose.Schema.Types.ObjectId;

const ConnectionRequestSchema = new mongoose.Schema({
  // ID of the user who is sending the connection request.
  'sender': {
    'type': ObjectId,
    'required': 'The connection request must have a sender.',
  },
  // ID of the user who is receiving the connection request.
  'recipient': {
    'type': ObjectId,
    'required': 'The connection request must have a recipient.',
  },
  // Whether the connection request has been accepted.
  'accepted': {
    'type': Boolean,
    'default': false,
  },
});

const ConnectionRequest = mongoose.model('ConnectionRequest', ConnectionRequestSchema);
export default ConnectionRequest;
