const config = require('../../config');

const { signIn } = require('../auth.controller');

const { initRoles, initAdminUser } = require('../../libs/initialSetup');
const { connect, closeDatabase } = require('../../libs/db-config');

const mockRequest = {};

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockImplementation((info) => info);

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

    await signIn('', res, mockNext);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledTimes(1);
  });

  it('should not login a user if the user does not exist', async () => {
    mockRequest.body = {
      email: 'user@example.co',
      password: 'password',
    };

    const res = mockResponse();

    await signIn(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith({ statusCode: 404, message: 'Wrong email or password' });
  });

  it('should not login a user if password does not match with hash', async () => {
    mockRequest.body = {
      email: config.adminEmail,
      password: 'password',
    };

    const res = mockResponse();

    await signIn(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(401);
  });

  it('should login a user successfully', async () => {
    mockRequest.body = {
      email: config.adminEmail,
      password: config.adminPassword,
    };

    const res = mockResponse();

    await signIn(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('token');
  });
});
