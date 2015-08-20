import express from 'express';
import routeUtils from './route_utils';

// This causes a lint error because only constructors are allowed to have positive letters.
/*eslint-disable*/
const router = express.Router();
/*eslint-enable*/

router.post('/heartbeats/', function handleHeartbeat(req, res) {
  // Extract the desired parameters.
  const LATITUDE = 'latitude';
  const LONGITUDE = 'longitude';
  const params = routeUtils.checkParams([LATITUDE, LONGITUDE], req, res);
  if (params === null) {
    return;
  }

  res.send('Your latitude is ' + params[LATITUDE] + ' and your longitude is ' + params[LONGITUDE]);
});

export default router;
