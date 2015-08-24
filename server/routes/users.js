// API endpoints for managing an account.

import 'source-map-support/register';
import HttpStatus from 'http-status-codes';
import express from 'express';
import passport from  '../config/passport';
import {sendSuccessResponse, sendFailureResponse, makeErr} from './route_utils';
import User from '../models/user';
import Promise from 'bluebird';

Promise.promisifyAll(User);

// This causes a lint error because only constructors are allowed to have positive letters.
/*eslint-disable*/
const router = express.Router();
/*eslint-enable*/

// Remove a user from the system.
router.delete('/me',
    passport.authenticate('bearer', {'session': false}),
    function deleteUser(req, res) {
      // Delete the user.
      User.remove({'_id': req.user._id}).then(function onRemove() {
        sendSuccessResponse(res, 'Removed user', {});
      }).catch(function onFailedRemove(err) {
        sendFailureResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

// Update the user's phone number or name.
router.put('/me',
    passport.authenticate('bearer', {'session': false}),
    function updateUser(req, res) {
      // Find the user.
      User.findOneAsync({'_id': req.user._id}).then(function onFound(user) {
        if (!user) {
          return Promise.reject(makeErr(HttpStatus.NOT_FOUND, 'Could not find user'));
        }
        // Set the phone number and name and save the user.
        if (req.body.phone !== undefined) {
          user.phone = req.body.phone;
        }
        if (req.body.name !== undefined) {
          user.name = req.body.name;
        }
        Promise.promisifyAll(user);
        return user.saveAsync();
      }).then(function onSave(users) {
        // If there's no error saving, return the user.
        if (users.length !== 2 || users[1] !== 1) {
          return Promise.reject(makeErr(HttpStatus.INTERNAL_SERVER_ERROR, 'Could not save user'));
        }
        sendSuccessResponse(res, 'Updated user', {
          'name': users[0].name,
          'phone': users[0].phone,
          'email': users[0].email,
        });
      }).catch(function onError(err) {
        if (err.name === 'ValidationError') {
          err.statusCode = HttpStatus.BAD_REQUEST;
        }
        sendFailureResponse(res, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

// Get a user's information.
router.get('/me',
    passport.authenticate('bearer', {'session': false}),
    function getUserInfo(req, res) {
      // Find the user.
      User.findOneAsync({'_id': req.user._id}).then(function onFound(user) {
        if (!user) {
          return Promise.reject(makeErr(HttpStatus.NOT_FOUND, 'Could not find user'));
        }
        sendSuccessResponse(res, 'User Info', {
          'name': user.name,
          'phone': user.phone,
          'email': user.email,
        });
      }).catch(function onError(err) {
        sendFailureResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

export default router;
