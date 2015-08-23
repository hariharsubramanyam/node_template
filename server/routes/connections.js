// API endpoints for managing connections.

import 'source-map-support/register';
import HttpStatus from 'http-status-codes';
import passport from '../config/passport';
import User from '../models/user';
import Connection from '../models/connection';
import Promise from 'bluebird';
import express from 'express';
import {sendSuccessResponse, sendFailureResponse} from './route_utils';
import {checkParams} from './route_utils';


Promise.promisifyAll(User);
Promise.promisifyAll(Connection);
const checkParamsAsync = Promise.promisify(checkParams);

// This causes a lint error because only constructors are allowed to have positive letters.
/*eslint-disable*/
const router = express.Router();
/*eslint-enable*/

function isConnectionBetween(idA, idB) {
  const aSendBRec = {
    '$and': [
      {'sender': idA},
      {'recipient': idB},
    ],
  };
  const bSendARec = {
    '$and': [
      {'sender': idB},
      {'recipient': idA},
    ],
  };
  const connectionExists = {
    '$or': [
      aSendBRec,
      bSendARec,
    ],
  };

  return Connection.findOneAsync(connectionExists);
}

// Get all the connections for the given user.
router.get('/connections',
    passport.authenticate('bearer', {'session': false}),
    function getConnections(req, res) {
      const filterCondition = {
        '$or': [
          {'sender': req.user._id},
          {'recipient': req.user._id},
        ],
      };
      Connection.findAsync(filterCondition).then(function onFound(connections) {
        sendSuccessResponse(res, 'success', connections);
      }).catch(function onError(err) {
        sendFailureResponse(res, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

// Send a connection request to a given user.
router.post('/connections',
    passport.authenticate('bearer', {'session': false}),
    function makeConnection(req, res) {
      const userPromise = checkParamsAsync(['email'], req, res).then(function onValid() {
        if (req.user.email === req.body.email) {
          const err = new Error('You cannot send a connection request to yourself');
          err.statusCode = HttpStatus.BAD_REQUEST;
          return Promise.reject(err);
        }
        return User.findOneAsync({'email': req.body.email});
      });

      const connectionPromise = userPromise.then(function onFoundUser(user) {
        if (!user) {
          const err = new Error('Cannot send connection request because recipient does not exist');
          err.statusCode = HttpStatus.NOT_FOUND;
          return Promise.reject(err);
        }
        return isConnectionBetween(user._id, req.user._id);
      });

      Promise.join(userPromise, connectionPromise, function onPromises(user, connection) {
        if (connection) {
          const err = new Error('There is already a connection or connection request');
          err.statusCode = HttpStatus.FORBIDDEN;
          return Promise.reject(err);
        }
        const connectionRequest = new Connection();
        connectionRequest.sender = req.user._id;
        connectionRequest.recipient = user._id;
        connectionRequest.accepted = false;
        Promise.promisifyAll(connectionRequest);
        return connectionRequest.saveAsync();
      }).then(function onSave(connections) {
        if (connections.length !== 2 || connections[1] !== 1) {
          return Promise.reject(new Error('Could not save connection'));
        }
        sendSuccessResponse(res, 'Created connection request', {
          'sender': req.user.email,
          'recipient': req.body.email,
        });
      }).catch(function onError(err) {
        sendFailureResponse(res, err.statusCode || HttpStatus.INTERNAL_SERVER_ERROR, err);
      });
    });

export default router;
