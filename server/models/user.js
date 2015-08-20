const mongoose = require('mongoose');

// Comes from: http://emailregex.com/.
const emailRegex = new RegExp('^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_]'
      + '[-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net'
      + '|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]'
      + '{1,5})?$', 'i');

const UserSchema = new mongoose.Schema({
  // Names must consist of letters and either the ' or - characters.
  'name': {'type': String, 'match': /^[a-zA-Z'-]+$/},
  // Phone numbers consist of 10 to 15 digits.
  'phone': {'type': String, 'match': /\d{10, 15}/},
  'email': {'type': String, 'match': emailRegex},
  'contacts': [ObjectId],
  'heartbeat_streams': [ObjectId],
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
