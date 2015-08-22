// Users are the people who use this app.

import 'source-map-support/register';
import mongoose from 'mongoose';
import {emailRegex, phoneRegex, nameRegex} from './model_regexes';

const UserSchema = new mongoose.Schema({
  // Name of this user. Names must consist of letters, spaces, ', and -.
  'name': {'type': String, 'match': nameRegex, 'required': 'User must have a name.', 'index': true},
  // The hash of the password for this user.
  'hashPassword': {'type': String, 'required': 'User must have a password.'},
  // Phone number for this user. Phone numbers consist of 10 to 15 digits.
  'phone': {
    'type': String,
    'match': phoneRegex,
    'required': 'User must have phone number.',
  },
  // The email address for this user.
  'email': {'type': String, 'match': emailRegex, 'required': 'User must have an email.', 'unique': true},
  // The session token for this user.
  'token': {'type': String},
});

const User = mongoose.model('User', UserSchema);
export default User;
