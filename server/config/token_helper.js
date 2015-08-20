import 'source-map-support/register';
import jwt from 'jwt-simple';
import moment from 'moment';
import User from '../models/user';
import {TOKEN_SECRET} from './secrets';
import Promise from 'bluebird';

Promise.promisifyAll(User);

export function createToken(user) {
  const expirationDays = 1;
  const expires = moment().add('days', expirationDays).valueOf();
  const token = jwt.encode({
    'userId': user.id,
    'expires': expires,
  }, TOKEN_SECRET);
  return token;
}

export function verifyToken(token, callback) {
  try {
    const decodedToken = jwt.decode(token, TOKEN_SECRET);
    User.findOneAsync({'_id': decodedToken.userId}).then(function foundUser(user) {
      if (!user) {
        callback('The user does not exist.');
      } else if (decodedToken.expires <= Date.now) {
        callback('The token has expired.');
      } else {
        callback(null, user);
      }
    }).catch(function onError(err) {
      callback(err);
    });
  } catch (ex) {
    callback('Could not decode token');
  }
}
