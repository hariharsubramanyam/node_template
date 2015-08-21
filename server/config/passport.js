// Configures passport to use a local strategy (i.e. username and password) and also sets up a
// HTTP Bearer token for authenticating each request.

import 'source-map-support/register';
import bcrypt from 'bcrypt';
import passport from 'passport';
import passportLocal from 'passport-local';
import passportHttpBearer from 'passport-http-bearer';
import {verifyToken} from './token_helper';
import User from '../models/user';
import Promise from 'bluebird';

Promise.promisifyAll(User);
Promise.promisifyAll(bcrypt);

// Set up the local strategy.
passport.use(new passportLocal.Strategy({
  'usernameField': 'username',
  'passwordField': 'password',
}, function onLogin(username, password, done) {
  // Find the user.
  const userPromise = User.findOneAsync({'name': username});

  // Ensure that the user exists and check the password.
  const passwordPromise = userPromise.then(function onFoundUser(user) {
    if (!user) {
      return Promise.reject(new Error('User does not exist.'));
    }
    return bcrypt.compareAsync(password, user.hashPassword);
  });

  // Find the user and ensure the password is correct.
  Promise.join(userPromise, passwordPromise, function onBothPromises(user, passwordsMatch) {
    if (!passwordsMatch) {
      return done('Invalid login credentials');
    }
    return done(null, user);
  }).catch(done);
}));

// Set up the bearer strategy for ensuring that the HTTP Bearer token is correct.
passport.use(new passportHttpBearer.Strategy(function onBearer(token, done) {
  verifyToken(token, done);
}));

export default passport;
