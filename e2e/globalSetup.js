const path = require('path');
const { spawn } = require('child_process');
const nodeFetch = require('node-fetch');
const kill = require('tree-kill');

const mongoSetup = require('@shelf/jest-mongodb/setup');

const config = require('../config');

const port = process.env.PORT || 8888;
const baseUrl = process.env.REMOTE_URL || `http://127.0.0.1:${port}`;

const __e2e = {
  port,
  baseUrl,
  adminUserCredentials: {
    username: 'admin',
    name: 'Administrator',
    email: config.adminEmail,
    password: config.adminPassword,
    roles: ['admin'],
  },
  adminToken: null,
  testUserCredentials: {
    username: 'TestUser',
    name: 'User Test',
    email: 'test@test.co',
    password: '12345678',
    roles: ['waiter'],
  },
  testUserToken: null,
  childProcessPid: null,
  // in `testObjects` we keep track of objects created during the test run so
  // that we can clean up before exiting.
  // For example: ['users/foo@bar.baz', 'products/xxx', 'orders/yyy']
  // testObjects: [],
};

const fetch = (url, opts = {}) =>
  nodeFetch(`${baseUrl}${url}`, {
    ...opts,
    headers: {
      'content-type': 'application/json',
      ...opts.headers,
    },
    ...(opts.body && typeof opts.body !== 'string' ? { body: JSON.stringify(opts.body) } : {}),
  });

const fetchWithAuth =
  (token) =>
  (url, opts = {}) =>
    fetch(url, {
      ...opts,
      headers: {
        ...opts.headers,
        authorization: `Bearer ${token}`,
      },
    });

const fetchAsAdmin = (url, opts) => fetchWithAuth(__e2e.adminToken)(url, opts);
const fetchAsTestUser = (url, opts) => fetchWithAuth(__e2e.testUserToken)(url, opts);

const createTestUser = () =>
  fetchAsAdmin('/users', {
    method: 'POST',
    body: __e2e.testUserCredentials,
    headers: { 'Content-Type': 'application/json' },
  })
    .then((resp) => {
      if (resp.status > 201) {
        throw new Error('Could not create test user');
      }
      return fetch('/auth', { method: 'POST', body: __e2e.testUserCredentials });
    })
    .then((resp) => {
      if (resp.status > 201) {
        throw new Error('Could not authenticate test user');
      }
      return resp.json();
    })
    .then(({ token }) => Object.assign(__e2e, { testUserToken: token }));

const checkAdminCredentials = () =>
  fetch('/auth', {
    method: 'POST',
    body: __e2e.adminUserCredentials,
  })
    .then((resp) => {
      if (resp.status > 201) {
        throw new Error('Could not authenticate as admin user');
      }

      return resp.json();
    })
    .then(({ token }) => Object.assign(__e2e, { adminToken: token }));

const checkTestUserCredentials = () =>
  fetch('/auth', {
    method: 'POST',
    body: __e2e.testUserCredentials,
  })
    .then((resp) => {
      if (resp.status > 201) {
        throw new Error('Could not authenticate as test user');
      }

      return resp.json();
    })
    .then(({ token }) => Object.assign(__e2e, { testUserToken: token }));

const waitForServerToBeReady = (retries = 10) =>
  new Promise((resolve, reject) => {
    if (!retries) {
      return reject(new Error('Server took to long to start'));
    }

    setTimeout(() => {
      fetch('/')
        .then((resp) => (resp.status !== 200 ? reject(new Error(`GET / responded with ${resp.status}`)) : resolve()))
        .catch(() => waitForServerToBeReady(retries - 1).then(resolve, reject));
    }, 1000);
  });

module.exports = () =>
  new Promise((resolve, reject) => {
    if (process.env.REMOTE_URL) {
      console.info(`Running tests on remote server ${process.env.REMOTE_URL}`);
      return resolve();
    }

    mongoSetup().then(() => {
      console.info('Staring local server...');
      // Which is checking the operating system if ti's windows it runs npm.cmd if it's linux just npm
      const child = spawn(/^win/.test(process.platform) ? 'npm.cmd' : 'npm', ['start', process.env.PORT || 8888], {
        cwd: path.resolve(__dirname, '../'),
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      Object.assign(__e2e, { childProcessPid: child.pid });

      child.stdout.on('data', (chunk) => {
        console.info(`\x1b[34m${chunk.toString()}\x1b[0m`);
      });

      child.stderr.on('data', (chunk) => {
        const str = chunk.toString();
        if (/DeprecationWarning/.test(str)) {
          return;
        }
        console.error('child::stderr', str);
      });

      process.on('uncaughtException', (err) => {
        console.error('UncaughtException!');
        console.error(err);
        kill(child.pid, 'SIGKILL', () => process.exit(1));
      });

      waitForServerToBeReady()
        .then(checkAdminCredentials)
        .then(createTestUser)
        .then(checkTestUserCredentials)
        .then(resolve)
        .catch((err) => {
          kill(child.pid, 'SIGKILL', () => reject(err));
        });
    });
  });

// Export globals - ugly... :-(
global.__e2e = __e2e;

// Export stuff to be used in tests!
process.baseUrl = baseUrl;
process.fetch = fetch;
process.fetchWithAuth = fetchWithAuth;
process.fetchAsAdmin = fetchAsAdmin;
process.fetchAsTestUser = fetchAsTestUser;
