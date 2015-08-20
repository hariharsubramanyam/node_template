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

passport.use(new passportLocal.Strategy({
  'usernameField': 'username',
  'passwordField': 'password',
}, function onLogin(username, password, done) {
  const userPromise = User.findOneAsync({'name': username});
  const passwordPromise = userPromise.then(function onFoundUser(user) {
    if (!user) {
      throw new Error('User does not exist.');
    }
    return bcrypt.compareAsync(password, user.hashPassword);
  });
  Promise.join(userPromise, passwordPromise, function onBothPromises(user, passwordsMatch) {
    if (!passwordsMatch) {
      return done('Invalid login credentials');
    }
    return done(null, user);
  }).catch(done);
}));

passport.use(new passportHttpBearer.Strategy(function onBearer(token, done) {
  verifyToken(token, done);
}));

export default passport;
