module.exports = {
  mongodbMemoryServerOptions: {
    binary: {
      version: '4.0.3', // Version of MongoDB
      skipMD5: true,
    },
    instance: {
      dbName: 'jest',
    },
    autoStart: false,
  },
};
