// API endpoints for authenticating the user.

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

// Generate a new token for the user, provided that they've given a 'username' and 'password' in the
// request body.
router.put('/token',
    passport.authenticate('local', {'session': false}),
    function tokenCallback(req, res) {
      const token = createToken(req.user);
      sendSuccessResponse(res, 'Successfully obtained token', {
        'token': token,
        'username': req.user.username,
      });
    });

// Validate the token for the given user. The token must be a HTTP Bearer. That is, if the token is
// <token>, we expect the value 'Bearer <token>' to be set for the HTTP Header 'Authorization'.
//
// If successful, this will the username of the user.
router.get('/token',
    passport.authenticate('bearer', {'session': false}),
    function validateToken(req, res) {
      sendSuccessResponse(res, 'Valid token', {
        'username': req.user.username,
      });
    });

// Register a new user. The 'username', 'phone', 'email', and 'password' must appear in the request
// body.
//
// If successful, the result will contain the 'token' and the 'username'.
router.post('/token', function registerUser(req, res) {
  // Ensure that the parameters exist and search for the user.
  checkParamsAsync(['username', 'phone', 'email', 'password'], req, res).then(function onValid() {
    return User.findOneAsync({'name': req.body.username});
  }).then(function foundUser(user) {
    // Ensure the user exists and generate a salt.
    if (user) {
      const err = new Error('Username already exists');
      err.statusCode = HttpStatus.FORBIDDEN;
      return Promise.reject(err);
    }
    return bcrypt.genSaltAsync(SALT);
  }).then(function gotSalt(salt) {
    // Hash the password.
    return bcrypt.hashAsync(req.body.password, salt);
  }).then(function onPasswordHash(hashPassword) {
    // Create a user and save.
    const user = new User();
    user.hashPassword = hashPassword;
    user.name = req.body.username;
    user.phone = req.body.phone;
    user.email = req.body.email;

    Promise.promisifyAll(user);
    return user.saveAsync();
  }).then(function onUserSave(user) {
    // Create a token.
    const accessToken = createToken(user);
    sendSuccessResponse(res, 'Successfully registered', {
      'token': accessToken,
      'username': user.name,
    });
  }).catch(function onError(err) {
    sendFailureResponse(res, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err.toString());
  });
});

export default router;
