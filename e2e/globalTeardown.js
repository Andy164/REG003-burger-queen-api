const kill = require('tree-kill');
const mongoTeardown = require('@shelf/jest-mongodb/teardown');

module.exports = () =>
  new Promise((resolve) => {
    if (!global.__e2e.childProcessPid) {
      return resolve();
    }

    mongoTeardown();

    kill(global.__e2e.childProcessPid, 'SIGKILL', resolve);
    global.__e2e.childProcessPid = null;
  });
