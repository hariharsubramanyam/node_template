import routes from '../routes/index';
import authRoute from '../routes/auth';
import usersRoute from '../routes/users';
import connectionsRoute from '../routes/connections';

export default function setupRoutes(app) {
  app.use('/', routes);
  app.use('/api/v1/auth', authRoute);
  app.use('/api/v1/users', usersRoute);
  app.use('/api/v1/', connectionsRoute);
}
