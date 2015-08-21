// API endpoints for managing an account.

import 'source-map-support/register';
import HttpStatus from 'http-status-codes';
import express from 'express';
import passport from  '../config/passport';
import {sendSuccessResponse, sendFailureResponse} from './route_utils';
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
      // Ensure that the user exists, then delete the user.
      User.remove({'_id': req.user._id}).then(function onRemove() {
        sendSuccessResponse(res, 'Removed user', {});
      }).catch(function onFailedRemove(err) {
        sendFailureResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

// Update the user's phone number or email.
router.put('/me',
    passport.authenticate('bearer', {'session': false}),
    function updateUser(req, res) {
      // Find the user.
      User.findOneAsync({'_id': req.user._id}).then(function onFound(user) {
        if (!user) {
          throw new Error('Could not find user');
        }
        if (req.body.phone !== undefined) {
          user.phone = req.body.phone;
        }
        if (req.body.email !== undefined) {
          user.email = req.body.email;
        }
        return user.saveAsync();
      }).then(function onSave(user) {
        sendSuccessResponse(res, 'Updated user', {
          'phone': user.phone,
          'email': user.email,
        });
      }).catch(function onError(err) {
        sendFailureResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

// Get a user's information.
router.get('/me',
    passport.authenticate('bearer', {'session': false}),
    function getUserInfo(req, res) {
      // Find the user.
      const userPromise = User.findOneAsync({'_id': req.user._id});

      // Find the user's contacts.
      const contactsPromise = userPromise.then(function onFoundUser(user) {
        if (!user) {
          throw new Error('Could not find user');
        }
        return User.find({'_id': {
          '$in': user.contacts,
        }});
      });

      Promise.join(userPromise, contactsPromise, function onBothPromises(user, contacts) {
        // Fetch the contact info for each contact.
        const contactInfo = contacts.map(function pickName(contact) {
          return contact.name;
        });

        // Return the user info.
        sendSuccessResponse(res, 'User Info', {
          'name': user.name,
          'phone': user.phone,
          'email': user.email,
          'contacts': contactInfo,
        });
      }).catch(function onError(err) {
        sendFailureResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

export default router;
