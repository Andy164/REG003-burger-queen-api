/* eslint-disable object-curly-newline */
const User = require('../models/User');
const Role = require('../models/Role');

module.exports.createUser = async (req, res, next) => {
  try {
    // TODO Verificar si los roles existen
    // TODO Verificar formato de email y password
    // TODO Revisar sobre url

    const { username, name, email, password, roles } = req.body;

    const userByEmail = await User.findOne({ email });
    const userByUsername = await User.findOne({ username });

    if (userByEmail || userByUsername) return next(403);

    const newUser = new User({ username, name, email, password: await User.encryptPassword(password) });

    if (!roles && !roles.length) return next(400);

    const rolesInRole = await Role.find({ name: { $in: roles } });

    if (!rolesInRole.length) return next(400);

    newUser.roles = rolesInRole.map((role) => role._id);

    const {
      _doc: { password: pass, ...userSaved },
    } = await newUser.save();

    res.status(201).json(userSaved);
  } catch (error) {
    next(500);
  }
};

module.exports.getUsers = async (req, res, next) => {
  try {
    const { limit = 10, page = 1 } = req.query;

    const currentPage = Math.max(1, +page);

    const users = await User.find()
      .limit(+limit)
      .skip(+limit * (currentPage - 1));

    const status = users.length ? 200 : 204;

    res.status(status).json(users);
  } catch (error) {
    next(500);
  }
};

module.exports.getUserById = async (req, res, next) => {
  try {
    const {
      userInfo,
      params: { uid },
    } = req;

    // eslint-disable-next-line no-useless-escape
    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const result = regExp.test(uid);

    const prop = result ? 'email' : '_id';

    if (userInfo[prop] !== uid && !req.userInfo.roles.find(({ name }) => name === 'admin')) return next(403);

    const user = await User.findOne({ [prop]: uid }).populate('roles');

    if (!user) return next(404);

    res.status(200).json(user);
  } catch (error) {
    next(500);
  }
};

module.exports.updateUserById = async (req, res, next) => {
  try {
    // TODO Probar des userInfo

    const {
      userInfo,
      body,
      params: { uid },
    } = req;

    // eslint-disable-next-line no-useless-escape
    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const result = regExp.test(uid);

    const prop = result ? 'email' : '_id';

    const isNotAdmin = !userInfo.roles.find(({ name }) => name === 'admin');

    if ((userInfo[prop] !== uid && isNotAdmin) || (isNotAdmin && 'roles' in body)) return next(403);

    if (!Object.keys(body).length) return next(400);

    if ('password' in body) body.password = await User.encryptPassword(body.password);

    const updatedUser = await User.findOneAndUpdate({ [prop]: uid }, body, { new: true });

    if (!updatedUser) return next(404);

    res.status(201).json(updatedUser);
  } catch (error) {
    next(500);
  }
};

module.exports.deleteUserById = async (req, res, next) => {
  try {
    const {
      userInfo,
      params: { uid },
    } = req;

    // eslint-disable-next-line no-useless-escape
    const regExp = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g;
    const result = regExp.test(uid);

    const prop = result ? 'email' : '_id';

    const isNotAdmin = !userInfo.roles.find(({ name }) => name === 'admin');

    if (userInfo[prop] !== uid && isNotAdmin) return next(403);

    const deletedUser = await User.findOneAndDelete({ [prop]: uid });

    if (!deletedUser) return next(404);

    res.status(204).end();
  } catch (error) {
    next(500);
  }
};
