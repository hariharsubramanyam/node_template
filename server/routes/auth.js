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
import {checkBody} from './route_utils';

Promise.promisifyAll(User);
Promise.promisifyAll(bcrypt);
const checkBodyAsync = Promise.promisify(checkBody);

// This causes a lint error because only constructors are allowed to have positive letters.
/*eslint-disable*/
const router = express.Router();
/*eslint-enable*/

// Generate a new token for the user, provided that they've given a 'username' and 'password' in the
// request body.
router.put('/token',
    passport.authenticate('local', {'session': false}),
    function tokenCallback(req, res) {
      User.findOneAsync({'_id': req.user._id}).then(function onFound(user) {
        if (!user) {
          const err = new Error('Could not find user');
          err.statusCode = HttpStatus.FORBIDDEN;
          return Promise.reject(err);
        }
        user.token = createToken(user);
        Promise.promisifyAll(user);
        return user.saveAsync();
      }).then(function onSave(users) {
        if (users.length !== 2 || users[1] !== 1) {
          const err = new Error('Could not save user');
          err.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
          return Promise.reject(err);
        }
        sendSuccessResponse(res, 'Successfully obtained token', {
          'token': users[0].token,
          'name': users[0].name,
        });
      }).catch(function onErr(err) {
        sendFailureResponse(res, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err);
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
        'name': req.user.username,
      });
    });

// Register a new user. The 'username', 'phone', 'email', and 'password' must appear in the request
// body.
//
// If successful, the result will contain the 'token' and the 'username'.
router.post('/token', function registerUser(req, res) {
  // Ensure that the parameters exist and search for the user.
  checkBodyAsync(['username', 'phone', 'email', 'password'], req, res).then(function onValid() {
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
    user.token = createToken(user);

    Promise.promisifyAll(user);
    return user.saveAsync();
  }).then(function onUserSave(users) {
    if (users.length !== 2 || users[1] !== 1) {
      const err = new Error('Could not save user');
      err.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      return Promise.reject(err);
    }
    sendSuccessResponse(res, 'Successfully registered', {
      'token': users[0].token,
      'name': users[0].name,
    });
  }).catch(function onError(err) {
    if (err.name === 'ValidationError') {
      err.statusCode = HttpStatus.BAD_REQUEST;
    }
    sendFailureResponse(res, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err.toString());
  });
});

export default router;
