// Generate and verify JSON Web Tokens.

import 'source-map-support/register';
import jwt from 'jwt-simple';
import moment from 'moment';
import User from '../models/user';
import {TOKEN_SECRET} from './secrets';
import Promise from 'bluebird';

Promise.promisifyAll(User);

// Create a token that lasts 1 day and encodes the user's id.
export function createToken(user) {
  const expirationDays = 1;
  const expires = moment().add('days', expirationDays).valueOf();
  const token = jwt.encode({
    'userId': user.id,
    'expires': expires,
  }, TOKEN_SECRET);
  return token;
}

// Ensure that the given token is valid and return the user that it's associated with.
export function verifyToken(token, callback) {
  try {
    const decodedToken = jwt.decode(token, TOKEN_SECRET);

    // Ensure that there's a user associated with this token.
    User.findOneAsync({'_id': decodedToken.userId}).then(function foundUser(user) {
      if (!user) {
        callback('The user does not exist.');
      } else if (decodedToken.expires <= Date.now()) {
        callback('The token has expired.');
      } else if (user.token !== decodedToken) {
        callback('The token is incorrect.');
      } else {
        // Ensure the token is stored in the database.
        callback(null, user);
      }
    }).catch(function onError(err) {
      callback(err);
    });
  } catch (ex) {
    callback('Could not decode token');
  }
}
