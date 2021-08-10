require('dotenv').config();

exports.port = process.argv[2] || process.env.PORT;

exports.dbURL = process.argv[3] ? process.env.DB_URL_TEST : process.env.DB_URL;

exports.dbURLTest = process.env.DB_URL_TEST;

exports.nodeEnv = process.env.NODE_ENV;

exports.secret = process.env.JWT_SECRET;

exports.adminEmail = process.env.ADMIN_EMAIL;

exports.adminPassword = process.env.ADMIN_PASSWORD;
