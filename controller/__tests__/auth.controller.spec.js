const { signIn } = require('../auth.controller');

const config = require('../../config');
const { connect } = require('../../libs/db-config');

beforeAll(async () => {
  await connect();
});

// TODO Close all

describe.skip('getUsers', () => {
  it('should create new auth token and allow access using it', async () => {
    const req = {
      body: {
        email: config.adminEmail,
        password: config.adminPassword,
      },
    };

    const res = await signIn(req);

    expect(res.headers['Content-Type']).toBe('application-json');
    expect(res.status).toEqual(200);
    expect(res.body.token.length).toBeGreaterThan(0);
  });
});
