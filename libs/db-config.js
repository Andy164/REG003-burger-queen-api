const mongoose = require('mongoose');

// in-memory db used only in unit testing
module.exports.connect = async () => {
  const mongooseOpts = {
    // autoReconnect: true,
    // reconnectTries: Number.MAX_VALUE,
    // reconnectInterval: 1000,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: true,
  };

  await mongoose.connect(global.__MONGO_URI__, mongooseOpts);
};

// Drop database, close the connection.
// Used by both unit and e2e tests
module.exports.closeDatabase = async () => {
  // await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
};

// Remove all the data for all db collections.
// Used by both unit and e2e tests
module.exports.clearDatabase = () => {
  const { collections } = mongoose.connection;

  const keys = Object.keys(collections);

  keys.forEach(async (key) => {
    const collection = collections[key];

    await collection.deleteMany();
  });
};
