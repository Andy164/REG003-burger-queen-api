const jwt = require('jsonwebtoken');

const User = require('../models/User');

module.exports = (secret) => (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) return next();

  const [type, token] = authorization.split(' ');

  if (type.toLowerCase() !== 'bearer') return next();

  jwt.verify(token, secret, async (err, decodedToken) => {
    if (err) return next(403);

    const userInfo = await User.findById(decodedToken.uid, { email: 1, roles: 1 }).populate('roles');

    if (!userInfo) return next(404);

    req.userInfo = userInfo;

    next();
  });
};

module.exports.isAuthenticated = (req) => !!req.userInfo && !!req.userInfo._id;

module.exports.isAdmin = (req) => !!req.userInfo.roles.find(({ name }) => name === 'admin');

module.exports.isChef = (req) => !!req.userInfo.roles.find(({ name }) => name === 'chef');

module.exports.isWaiter = (req) => !!req.userInfo.roles.find(({ name }) => name === 'waiter');

module.exports.requireAuth = (req, res, next) => (!module.exports.isAuthenticated(req) ? next({ statusCode: 401, message: 'Need authentication' }) : next());

module.exports.requireAdmin = (req, res, next) => {
  const { isAuthenticated, isAdmin } = module.exports;

  if (!isAuthenticated(req)) return next({ statusCode: 401, message: 'Need authentication' });

  if (!isAdmin(req)) return next({ statusCode: 403, message: 'Need admin' });

  next();
};

module.exports.requireWaiter = (req, res, next) => {
  const { isAuthenticated, isWaiter } = module.exports;

  if (!isAuthenticated(req)) return next({ statusCode: 401, message: 'Need authentication' });

  if (!isWaiter(req)) return next({ statusCode: 403, message: 'Need waiter' });

  next();
};

module.exports.requireChefOrWaiter = (req, res, next) => {
  const { isAuthenticated, isChef, isWaiter } = module.exports;

  if (!isAuthenticated(req)) return next({ statusCode: 401, message: 'Need authentication' });

  if (isChef(req) || isWaiter(req)) return next();

  return next({ statusCode: 403, message: 'Need waiter or chef' });
};

module.exports.requireAdminOrChef = (req, res, next) => {
  const { isAuthenticated, isAdmin, isChef } = module.exports;

  if (!isAuthenticated(req)) return next({ statusCode: 401, message: 'Need authentication' });

  if (isAdmin(req) || isChef(req)) return next();

  next({ statusCode: 403, message: 'Need admin or chef' });
};
