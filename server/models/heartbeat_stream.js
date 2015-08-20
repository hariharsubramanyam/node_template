import 'source-map-support/register';
import mongoose from 'mongoose';

const HeartbeatStreamSchema = new mongoose.Schema({
  // The ID of the user who is sending out heartbeats.
  'sender': mongoose.Schema.Types.ObjectId,
  // The IDs of the users who are watching this stream.
  'recipients': [mongoose.Schema.Types.ObjectId],
  // The IDs of the heartbeats associated with this stream.
  'heartbeats': [mongoose.Schema.Types.ObjectId],
});

const HeartbeatStream = mongoose.model('HeartbeatStream', HeartbeatStreamSchema);
export default HeartbeatStream;
