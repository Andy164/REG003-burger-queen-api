const { signIn } = require('../auth.controller');

const config = require('../../config');

const { initRoles, initAdminUser } = require('../../libs/initialSetup');
const { connect, closeDatabase } = require('../../testSetup/db-config');

const mockRequest = (body) => ({
  body,
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn().mockImplementation((err) => err);

const app = {
  get: jest.fn().mockImplementation(() => ({ adminEmail: config.adminEmail, adminPassword: config.adminPassword })),
};

// Connect to a new in-memory database before running any tests.
beforeAll(async () => {
  await connect();

  await initRoles();
  await initAdminUser(app);
});

// Remove and close the db and server.
afterAll(async () => {
  await closeDatabase();
});

describe('getUsers', () => {
  it('should fail when bad request', async () => {
    const res = mockResponse();
    const next = mockNext;

    await signIn('', res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('should not login a user if the user does not exist', async () => {
    const req = mockRequest({
      email: 'user@example.co',
      password: 'password',
    });

    const res = mockResponse();
    const next = mockNext;

    await signIn(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith({ statusCode: 404, message: 'Wrong email or password' });
  });

  it('should not login a user if password does not match with hash', async () => {
    const req = mockRequest({
      email: config.adminEmail,
      password: 'password',
    });

    const res = mockResponse();
    const next = mockNext;

    await signIn(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(401);
  });

  it('should login a user successfully', async () => {
    const req = mockRequest({
      email: config.adminEmail,
      password: config.adminPassword,
    });

    const res = mockResponse();
    const next = mockNext;

    await signIn(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
  });
});
