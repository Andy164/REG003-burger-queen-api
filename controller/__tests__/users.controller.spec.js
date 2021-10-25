const config = require('../../config');

const { createUser, getUsers, getUserById, updateUserById, deleteUserById } = require('../users.controller');

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

afterAll(async () => {
  await closeDatabase();
});

describe('Create a User', () => {
  it('should not create a user if record already exists', async () => {
    mockRequest.body = {
      username: 'admin',
      name: 'Administrador',
      email: config.adminEmail,
      password: config.adminPassword,
      roles: ['admin'],
    };

    const res = mockResponse();

    await createUser(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(403);
  });

  it('should not create a user when bad roles', async () => {
    mockRequest.body = {
      username: 'Marco',
      name: 'Marco Díaz',
      email: 'marco@test.com',
      password: '12345678',
      roles: ['otro'],
    };

    const res = mockResponse();

    await createUser(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(400);
  });

  it('should create a user successfully', async () => {
    mockRequest.body = {
      username: 'Lola',
      name: 'Lola Díaz',
      email: 'lola@test.com',
      password: '12345678',
      roles: ['chef'],
    };

    const res = mockResponse();

    await createUser(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('email', 'lola@test.com');
  });
});

// describe('Get Users', () => {
//   it('should get all users', async () => {
//     mockRequest.query = {
//       limit: 10,
//       page: 1,
//     };

//     const res = mockResponse();

//     await getUsers(mockRequest, res, mockNext);

//     const { value } = res.json.mock.results[0];

//     expect(res.status).toHaveBeenCalledWith(200);
//     expect(res.json).toHaveBeenCalledTimes(1);
//     expect(value).toHaveLength(2);
//   });
// });

describe('Get Users By Id', () => {
  it('should fail when no admin', async () => {
    mockRequest.userInfo = {
      roles: [{ name: 'chef' }],
      email: 'lola@test.co',
    };

    mockRequest.params = {
      uid: config.adminEmail,
    };

    const res = mockResponse();

    await getUserById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(403);
  });

  it('should get the user', async () => {
    mockRequest.userInfo = {
      roles: [{ name: 'admin' }],
      email: config.adminEmail,
    };

    mockRequest.params = {
      uid: config.adminEmail,
    };

    const res = mockResponse();

    await getUserById(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('email', config.adminEmail);
  });
});

describe('Update user', () => {
  it('should fail when no admin or the user', async () => {
    mockRequest.userInfo = {
      roles: [{ name: 'chef' }],
      email: 'lola@test.co',
    };

    mockRequest.params = {
      uid: config.adminEmail,
    };

    const res = mockResponse();

    await updateUserById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(403);
  });

  it('should fail when no admin and try update roles', async () => {
    mockRequest.body = {
      roles: ['admin'],
    };

    mockRequest.userInfo = {
      roles: [{ name: 'chef' }],
      email: 'lola@test.co',
    };

    mockRequest.params = {
      uid: 'lola@test.co',
    };

    const res = mockResponse();

    await updateUserById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(403);
  });

  it('should fail when no body', async () => {
    mockRequest.body = {};

    mockRequest.userInfo = {
      roles: [{ name: 'chef' }],
      email: 'lola@test.co',
    };

    mockRequest.params = {
      uid: 'lola@test.co',
    };

    const res = mockResponse();

    await updateUserById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(400);
  });

  it('should update the password of the user', async () => {
    mockRequest.body = {
      password: '12345678',
    };

    mockRequest.userInfo = {
      roles: [{ name: 'admin' }],
      email: config.adminEmail,
    };

    mockRequest.params = {
      uid: config.adminEmail,
    };

    const res = mockResponse();

    await updateUserById(mockRequest, res, mockNext);

    const { value } = res.json.mock.results[0];

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledTimes(1);
    expect(value).toHaveProperty('email', config.adminEmail);
  });
});

describe('Delete a user', () => {
  it('should fail when no admin or the user', async () => {
    mockRequest.userInfo = {
      roles: [{ name: 'chef' }],
      email: 'lola@test.co',
    };

    mockRequest.params = {
      uid: config.adminEmail,
    };

    const res = mockResponse();

    await deleteUserById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(403);
  });

  it('should fail when not found user', async () => {
    mockRequest.userInfo = {
      roles: [{ name: 'admin' }],
      email: config.adminEmail,
    };

    mockRequest.params = {
      uid: 'billy@test.co',
    };

    const res = mockResponse();

    await deleteUserById(mockRequest, res, mockNext);

    expect(mockNext).toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalledWith(404);
  });

  it('should delete the user', async () => {
    mockRequest.body = {};

    mockRequest.userInfo = {
      roles: [{ name: 'admin' }],
      email: config.adminEmail,
    };

    mockRequest.params = {
      uid: 'lola@test.com',
    };

    const res = mockResponse();

    await deleteUserById(mockRequest, res, mockNext);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.json).toHaveBeenCalledTimes(0);
  });
});
