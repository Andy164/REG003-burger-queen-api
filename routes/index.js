const auth = require('./auth.routes');
const users = require('./users.routes');
const products = require('./products.routes');
const orders = require('./orders.routes');

const root = (app, next) => {
  const pkg = app.get('pkg');

  app.get('/', (req, res) => res.json({ name: pkg.name, version: pkg.version }));
  app.all('*', (req, resp, nextAll) => nextAll(404));

  return next();
};

// eslint-disable-next-line consistent-return
const register = (app, routes, cb) => {
  if (!routes.length) return cb();

  routes[0](app, (err) => {
    if (err) {
      // console.log('Este es el error en register desde routes: ', err);
      return cb(err);
    }

    return register(app, routes.slice(1), cb);
  });
};

module.exports = (app, next) => register(app, [auth, users, products, orders, root], next);
