import mongoose from 'mongoose';
import regexes from 'model_regexes';

const UserSchema = new mongoose.Schema({
  // Name of this user. Names must consist of letters, spaces, ', and -.
  'name': {'type': String, 'match': regexes.nameRegex},
  // Phone number for this user. Phone numbers consist of 10 to 15 digits.
  'phone': {'type': String, 'match': regexes.phoneRegex},
  // The email address for this user.
  'email': {'type': String, 'match': regexes.emailRegex},
  // The IDs of the users who have been marked as contacts for the given user.
  'contacts': [mongoose.Schema.Types.ObjectId],
  // The IDs of the heartbeat streams that this user is associated with,
  // either as sender or recipient.
  'heartbeat_streams': [mongoose.Schema.Types.ObjectId],
});

const User = mongoose.model('User', UserSchema);
export default User;
