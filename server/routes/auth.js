import 'source-map-support/register';
import express from 'express';
import HttpStatus from 'http-status-codes';
import passport from  '../config/passport';
import {createToken} from '../config/token_helper';
import {sendSuccessResponse, sendFailureResponse} from './route_utils';
import User from '../models/user';
import Promise from 'bluebird';
import bcrypt from 'bcrypt';
import {SALT} from '../config/secrets';
import {checkParams} from './route_utils';

Promise.promisifyAll(User);
Promise.promisifyAll(bcrypt);
const checkParamsAsync = Promise.promisify(checkParams);

// This causes a lint error because only constructors are allowed to have positive letters.
/*eslint-disable*/
const router = express.Router();
/*eslint-enable*/

router.post('/token',
    passport.authenticate('local', {'session': false}),
    function tokenCallback(req, res) {
      const token = createToken(req.user);
      sendSuccessResponse(res, 'Successfully obtained token', {
        'token': token,
        'username': req.user.username,
      });
    });

router.get('/validate',
    passport.authenticate('local', {'session': false}),
    function validateToken(req, res) {
      sendSuccessResponse(res, 'Valid token', {
        'username': req.user.username,
      });
    });

router.post('/register', function registerUser(req, res) {
  checkParamsAsync(['username', 'phone', 'email', 'password'], req, res).then(function onValid() {
    return User.findOneAsync({'name': req.body.username});
  }).then(function foundUser(user) {
    if (user) {
      throw new Error('Username already exists');
    }
    return bcrypt.genSaltAsync(SALT);
  }).then(function gotSalt(salt) {
    return bcrypt.hashAsync(req.body.password, salt);
  }).then(function onPasswordHash(hashPassword) {
    const user = new User();
    user.hashPassword = hashPassword;
    user.name = req.body.username;
    user.phone = req.body.phone;
    user.email = req.body.email;

    Promise.promisifyAll(user);
    return user.saveAsync();
  }).then(function onUserSave(user) {
    const accessToken = createToken(user);
    sendSuccessResponse(res, 'Successfully registered', {
      'token': accessToken,
      'username': user.name,
    });
  }).catch(function onError(err) {
    sendFailureResponse(res, HttpStatus.OK, err.toString());
  });
});

export default router;
