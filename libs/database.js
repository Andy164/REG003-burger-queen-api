const mongoose = require('mongoose');

const { dbURL } = require('../config');

module.exports = async () => {
  try {
    await mongoose.connect(dbURL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: true,
      useCreateIndex: true,
    });
    // console.log('db is connected');
  } catch (error) {
    console.error('error al conectar: ', error);
  }
};
