// API endpoints for managing connection requests.

import 'source-map-support/register';
import HttpStatus from 'http-status-codes';
import passport from '../config/passport';
import User from '../models/user';
import ConnectionRequest from '../models/connection_request';
import Promise from 'bluebird';
import express from 'express';
import {sendSuccessResponse, sendFailureResponse} from './route_utils';
import {checkParams} from './route_utils';

Promise.promisifyAll(User);
Promise.promisifyAll(ConnectionRequest);
const checkParamsAsync = Promise.promisify(checkParams);

// This causes a lint error because only constructors are allowed to have positive letters.
/*eslint-disable*/
const router = express.Router();
/*eslint-enable*/

// Get all the connection requests for the given user.
router.get('/connections',
    passport.authenticate('bearer', {'session': false}),
    function getConnections(req, res) {
      User.findOneAsync({'_id': req.user._id}).then(function onFound(user) {
        if (!user) {
          return Promise.reject(new Error('Could not find user'));
        } else {
          const connections = user.connection_requests.map(function pick(cr) {
            return {
              'sender': cr.sender,
              'recipient': cr.recipient,
              'accepted': cr.accepted,
            };
          });
          sendSuccessResponse(res, 'Connection requests', connections);
        }
      }).catch(function onError(err) {
        sendFailureResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

router.post('/connections',
    passport.authenticate('bearer', {'session': false}),
    function makeConnection(req, res) {
      // Determine who to send connection request to and find the user to send to..
      const findUserPromise = checkParamsAsync(['email'], req, res).then(function onFound(params) {
        return User.findOneAsync({'email': params.email});
      });
      const findConnectionPromise = findUserPromise.then(function onFound(user) {
        // Ensure that the recipient exists and ensure that this connection request does not already
        // exist.
        if (!user) {
          return Promise.reject(new Error('Could not find user'));
        }
        return ConnectionRequest.findOneAsync({'sender': req.user._id, 'recipient': user._id});
      });
      Promise.join(findUserPromise, findConnectionPromise, function onFound(user, cr) {
        if (cr) {
          return Promise.reject(new Error('Connection request already exists'));
        }
        const connectionRequest = new ConnectionRequest();
        connectionRequest.sender = req.user._id;
        connectionRequest.recipient = user._id;
        connectionRequest.accepted = false;
        Promise.promisifyAll(connectionRequest);
        return connectionRequest.saveAsync();
      }).then(function onSave(connectionRequests) {
        if (connectionRequests.length === 0) {
          return Promise.reject(new Error('Could not save connection request'));
        }
        const connectionRequest = connectionRequests[0];
        sendSuccessResponse(res, 'Created connection request', {
          'sender': connectionRequest.sender,
          'recipient': connectionRequest.recipient,
          'accepted': connectionRequest.accepted,
        });
      }).catch(function onError(err) {
        sendFailureResponse(res, HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

export default router;
