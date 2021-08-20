const mongoose = require('mongoose');

const { dbURL } = require('../config');

module.exports.connect = async () => {
  try {
    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
  } catch (error) {
    console.error('error al conectar: ', error);
  }
};

module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};
