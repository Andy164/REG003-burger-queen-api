const kill = require('tree-kill');
// const memoryDatabaseServer = require('../db-config');

module.exports = () =>
  new Promise((resolve) => {
    if (!global.__e2e.childProcessPid) {
      return resolve();
    }

    // memoryDatabaseServer.clearDatabase();
    // memoryDatabaseServer.closeDatabase();

    kill(global.__e2e.childProcessPid, 'SIGKILL', resolve);
    global.__e2e.childProcessPid = null;
  });
