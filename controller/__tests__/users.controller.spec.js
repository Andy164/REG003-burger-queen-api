const config = require('../../config');

const { createUser, getUsers, getUserById, updateUserById, deleteUserById } = require('../users.controller');

const { initRoles, initAdminUser } = require('../../libs/initialSetup');
const { connect, closeDatabase } = require('../../testSetup/db-config');

const mockRequest = (body, query, userInfo, params) => ({
  body,
  query,
  userInfo,
  params,
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

describe('Create a User', () => {
  it('should not create a user if record already exists', async () => {
    const req = mockRequest({
      username: 'admin',
      name: 'Administrador',
      email: config.adminEmail,
      password: config.adminPassword,
      roles: ['admin'],
    });

    const res = mockResponse();
    const next = mockNext;

    await createUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(403);
  });

  it('should not create a user when bad roles', async () => {
    const req = mockRequest({
      username: 'Marco',
      name: 'Marco Díaz',
      email: 'marco@test.com',
      password: '12345678',
      roles: ['otro'],
    });

    const res = mockResponse();
    const next = mockNext;

    await createUser(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(403);
  });

  it('should create a user successfully', async () => {
    const req = mockRequest({
      username: 'Lola',
      name: 'Lola Díaz',
      email: 'lola@test.com',
      password: '12345678',
      roles: ['chef'],
    });

    const res = mockResponse();
    const next = mockNext;

    await createUser(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    // expect(res.json).toHaveProperty('email');
  });
});

describe('Get Users', () => {
  it('should get all users', async () => {
    const req = mockRequest(
      {},
      {
        limit: 10,
        page: 1,
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await getUsers(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(res.json).toHaveLength(1);
  });
});

describe('Get Users By Id', () => {
  it('should fail when no admin', async () => {
    const req = mockRequest(
      {},
      {},
      {
        roles: [{ name: 'chef' }],
        email: 'lola@test.co',
      },
      {
        uid: config.adminEmail,
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await getUserById(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(403);
  });

  it('should get the user', async () => {
    const req = mockRequest(
      {},
      {},
      {
        roles: [{ name: 'admin' }],
        email: config.adminEmail,
      },
      {
        uid: config.adminEmail,
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await getUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
  });
});

describe('Update user', () => {
  it('should fail when no admin or the user', async () => {
    const req = mockRequest(
      {},
      {},
      {
        roles: [{ name: 'chef' }],
        email: 'lola@test.co',
      },
      {
        uid: config.adminEmail,
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await updateUserById(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(403);
  });

  it('should fail when no admin and try update roles', async () => {
    const req = mockRequest(
      {
        roles: ['admin'],
      },
      {},
      {
        roles: [{ name: 'chef' }],
        email: 'lola@test.co',
      },
      {
        uid: 'lola@test.co',
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await updateUserById(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(403);
  });

  it('should fail when no body', async () => {
    const req = mockRequest(
      {},
      {},
      {
        roles: [{ name: 'chef' }],
        email: 'lola@test.co',
      },
      {
        uid: 'lola@test.co',
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await updateUserById(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(400);
  });

  it('should update the password of the user', async () => {
    const req = mockRequest(
      {
        password: '12345678',
      },
      {},
      {
        roles: [{ name: 'admin' }],
        email: config.adminEmail,
      },
      {
        uid: config.adminEmail,
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await updateUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
  });
});

describe('Delete a user', () => {
  it('should fail when no admin or the user', async () => {
    const req = mockRequest(
      {},
      {},
      {
        roles: [{ name: 'chef' }],
        email: 'lola@test.co',
      },
      {
        uid: config.adminEmail,
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await deleteUserById(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(403);
  });

  it('should fail when not found user', async () => {
    const req = mockRequest(
      {},
      {},
      {
        roles: [{ name: 'admin' }],
        email: config.adminEmail,
      },
      {
        uid: 'billy@test.co',
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await deleteUserById(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(404);
  });

  it('should delete the user', async () => {
    const req = mockRequest(
      {},
      {},
      {
        roles: [{ name: 'admin' }],
        email: config.adminEmail,
      },
      {
        uid: 'lola@test.com',
      }
    );

    const res = mockResponse();
    const next = mockNext;

    await deleteUserById(req, res, next);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledTimes(0);
  });
});
