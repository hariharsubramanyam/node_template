const mongoose = require('mongoose');

const HeartbeatSchema = new mongoose.Schema({
  // The date and time when this heartbeat was sent.
  'posted': Date,
  // The location this heartbeat was sent from. We create a geospatial index on it.
  'location': {'type': [Number], 'index': '2d'},
});

const Heartbeat = mongoose.model('Heartbeat', HeartbeatSchema);
module.exports = Heartbeat;
