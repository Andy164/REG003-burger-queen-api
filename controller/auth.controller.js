const jwt = require('jsonwebtoken');

const User = require('../models/User');
const config = require('../config');

const { secret } = config;

module.exports.signIn = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) return next(400);

    const user = await User.findOne({ email }).populate('roles');

    if (!user) return next({ statusCode: 404, message: 'Wrong email or password' });

    const isCorrectPassword = await User.comparePassword(password, user.password);

    if (!isCorrectPassword) return next(401);

    const token = jwt.sign({ uid: user._id }, secret, { expiresIn: 86400 });

    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({
      message: error.message || 'Failed to find resource.',
    });
  }
};
