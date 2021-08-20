const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const authMiddleware = require('./middleware/auth');
const errorHandler = require('./middleware/error');

const connectDB = require('./libs/db-config');
const { initRoles, initAdminUser } = require('./libs/initialSetup');

const config = require('./config');
const routes = require('./routes');
const pkg = require('./package.json');

connectDB();

const app = express();

// Express variables
app.set('config', config);
app.set('pkg', pkg);

// MIDDLEWARES
app.use(morgan('dev'));
app.use(cors());
// parse application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false }));
// Understand the JSON format that the server receives
app.use(express.json());
app.use(authMiddleware(app.get('config').secret));

// Registrar rutas
routes(app, async (err) => {
  if (err) throw err;

  await initRoles();
  await initAdminUser(app);

  app.use(errorHandler);

  app.listen(app.get('config').port, () => {
    console.info(`App listening on port ${app.get('config').port}`);
  });
});

module.exports.app = app;
